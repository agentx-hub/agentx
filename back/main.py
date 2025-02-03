import os
import random
import logging
import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.interval import IntervalTrigger
import tweepy
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from agents import CreativeSystemAgents
from tasks import (GenerateCreativeTweetsTask, GenerateAdvancedCreativeTweetsTask, PublishTweetsTask, 
                   PlanningTask, ReschedulingTask, CheckTweetTask, EngagementAnalysisTask)
from agents_db import agents_db
from local_json_db import LocalJSONDatabase

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Twitter Automation API")
scheduler = AsyncIOScheduler()
scheduler.start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agents_system = CreativeSystemAgents()

class CreateAgentRequest(BaseModel):
    name: str = Field(..., description="Agent name")
    personality_prompt: str = Field(..., description="Personality prompt")
    TWITTER_API_KEY: str = Field(..., description="Twitter API Key")
    TWITTER_API_SECRET_KEY: str = Field(..., description="Twitter API Secret Key")
    TWITTER_ACCESS_TOKEN: str = Field(..., description="Twitter Access Token")
    TWITTER_ACCESS_TOKEN_SECRET: str = Field(..., description="Twitter Access Token Secret")
    TWITTER_BEARER_TOKEN: str = Field(..., description="Twitter Bearer Token")



def schedule_daily_tweet_job(agent_id: str, personality_prompt: str, credentials: dict):
    next_run_time = planning_task()
    job_id = f"daily_tweet_job_{agent_id}"
    scheduler.add_job(
        execute_daily_tweet,
        trigger=DateTrigger(run_date=next_run_time),
        args=[agent_id, personality_prompt, credentials],
        id=job_id,
        replace_existing=True
    )
    logger.info(f"Agent {agent_id} scheduled for {next_run_time.isoformat()} UTC")

async def execute_daily_tweet(agent_id: str, personality_prompt: str, credentials: dict):
    logger.info(f"Agent {agent_id} executing daily tweet at {datetime.utcnow().isoformat()} UTC")
    if not all([personality_prompt, credentials.get("TWITTER_API_KEY"), credentials.get("TWITTER_API_SECRET_KEY"), credentials.get("TWITTER_ACCESS_TOKEN"), credentials.get("TWITTER_ACCESS_TOKEN_SECRET")]):
        logger.error(f"Agent {agent_id} missing credentials")
        return
    creative_agent = agents_system.creative_tweet_agent()
    advanced_agent = agents_system.advanced_creative_agent()
    posting_agent = agents_system.tweet_poster_agent(agent_id)
    planning_agent = agents_system.planning_agent(agent_id)
    engagement_agent = agents_system.engagement_agent(agent_id)
    creative_task = GenerateCreativeTweetsTask(agent=creative_agent, personality_prompt=personality_prompt)
    advanced_task = GenerateAdvancedCreativeTweetsTask(agent=advanced_agent, personality_prompt=personality_prompt)
    tweet_text = creative_task.execute() + " | " + advanced_task.execute()
    publish_task = PublishTweetsTask(agent=posting_agent, tweet_text=tweet_text)
    planning_task = PlanningTask(agent=planning_agent, task_name="Daily tweet verification")
    engagement_task = EngagementAnalysisTask(agent=engagement_agent, tweet_text=tweet_text)
    try:
        publish_result = publish_task.execute()
        planning_task.execute()
        engagement_result = engagement_task.execute()
        logger.info(f"Agent {agent_id} tweet published successfully. Publish result: {publish_result}. Engagement analysis: {engagement_result}")
    except Exception as e:
        logger.error(f"Agent {agent_id} error during tweet: {e}")
    schedule_daily_tweet_job(agent_id, personality_prompt, credentials)

class TwitterBot:
    def __init__(self, agent_id: str, credentials: dict, openai_api_key: Optional[str] = None):
        self.agent_id = agent_id
        self.api_key = credentials["TWITTER_API_KEY"]
        self.api_secret = credentials["TWITTER_API_SECRET_KEY"]
        self.acc_token = credentials["TWITTER_ACCESS_TOKEN"]
        self.acc_secret = credentials["TWITTER_ACCESS_TOKEN_SECRET"]
        self.bearer_token = credentials["TWITTER_BEARER_TOKEN"]
        self.openai_api_key = openai_api_key
        self.twitter_api = tweepy.Client(
            bearer_token=self.bearer_token,
            consumer_key=self.api_key,
            consumer_secret=self.api_secret,
            access_token=self.acc_token,
            access_token_secret=self.acc_secret,
            wait_on_rate_limit=True
        )
        self.db = LocalJSONDatabase()
        self.twitter_me_id = self.get_me_id()
        self.tweet_response_limit = 35
        if self.openai_api_key:
            self.llm = ChatOpenAI(temperature=0.1, openai_api_key=self.openai_api_key, model_name='gpt-4o-mini-2024-07-18')
        else:
            logger.warning(f"Agent {self.agent_id} OPENAI_API_KEY not provided")
            self.llm = None
        self.mentions_found = 0
        self.mentions_replied = 0
        self.mentions_replied_errors = 0
        logger.info(f"Agent {self.agent_id} TwitterReplyBot initialized")

    def get_me_id(self):
        try:
            user = self.twitter_api.get_me()
            if user and user.data:
                return user.data.id
        except Exception as e:
            logger.error(f"Agent {self.agent_id} error in get_me_id: {e}")
        return None

    def generate_response(self, text: str, topic: str = "general") -> str:
        if not self.openai_api_key or not self.llm:
            return "Sorry, I cannot respond without an OpenAI key."
        system_template = f"You are an expert in {topic}. Provide a concise and engaging response."
        system_message_prompt = SystemMessagePromptTemplate.from_template(system_template)
        human_message_prompt = HumanMessagePromptTemplate.from_template("{text}")
        chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])
        final_prompt = chat_prompt.format_prompt(text=text).to_messages()
        response = self.llm(final_prompt).content
        logger.debug(f"Agent {self.agent_id} generated response: {response}")
        return response

    def get_mentions(self):
        now = datetime.utcnow()
        start_time = now - timedelta(minutes=20)
        start_time_str = start_time.strftime("%Y-%m-%dT%H:%M:%SZ")
        response = self.twitter_api.get_users_mentions(
            id=self.twitter_me_id,
            start_time=start_time_str,
            expansions=['referenced_tweets.id'],
            tweet_fields=['created_at', 'conversation_id']
        )
        if response and hasattr(response, 'data') and response.data:
            logger.debug(f"Agent {self.agent_id} mentions retrieved: {len(response.data)}")
            return response.data
        logger.debug(f"Agent {self.agent_id} no mentions found")
        return []

    def get_parent_tweet(self, mention):
        if mention.conversation_id:
            conversation_tweet = self.twitter_api.get_tweet(mention.conversation_id).data
            if conversation_tweet:
                logger.debug(f"Agent {self.agent_id} parent tweet ID {conversation_tweet.id}")
                return conversation_tweet
        return None

    def check_already_responded(self, conversation_id: str) -> bool:
        return False

    def respond_to_mention(self, mention, parent_tweet):
        try:
            response_text = self.generate_response(parent_tweet.text)
            response_tweet = self.twitter_api.create_tweet(text=response_text, in_reply_to_tweet_id=mention.id)
            self.mentions_replied += 1
            self.db.insert({
                'mentioned_conversation_tweet_id': str(parent_tweet.id),
                'mentioned_conversation_tweet_text': parent_tweet.text,
                'tweet_response_id': response_tweet.data['id'],
                'tweet_response_text': response_text,
                'tweet_response_created_at': datetime.utcnow().isoformat(),
                'mentioned_at': mention.created_at.isoformat()
            })
        except Exception as e:
            logger.error(f"Agent {self.agent_id} error responding to mention: {e}")
            self.mentions_replied_errors += 1

    async def execute_replies(self):
        if not self.openai_api_key or not self.llm:
            logger.warning(f"Agent {self.agent_id} OPENAI_API_KEY not provided")
            return
        mentions = self.get_mentions()
        if not mentions:
            return
        self.mentions_found = len(mentions)
        for mention in mentions[:self.tweet_response_limit]:
            parent_tweet = self.get_parent_tweet(mention)
            if parent_tweet and parent_tweet.id != mention.id and not self.check_already_responded(parent_tweet.id):
                self.respond_to_mention(mention, parent_tweet)

async def execute_mentions(agent_id: str, credentials: dict, openai_api_key: Optional[str] = None):
    try:
        bot = TwitterReplyBot(agent_id, credentials, openai_api_key=openai_api_key)
        await bot.execute_replies()
    except Exception as e:
        logger.error(f"Agent {agent_id} error in execute_mentions_reply: {e}")

@app.post("/create-agent")
async def create_agent(req: CreateAgentRequest):
    agent_id = str(uuid.uuid4())
    credentials = {
        "personality_prompt": req.personality_prompt,
        "TWITTER_API_KEY": req.TWITTER_API_KEY,
        "TWITTER_API_SECRET_KEY": req.TWITTER_API_SECRET_KEY,
        "TWITTER_ACCESS_TOKEN": req.TWITTER_ACCESS_TOKEN,
        "TWITTER_ACCESS_TOKEN_SECRET": req.TWITTER_ACCESS_TOKEN_SECRET,
        "TWITTER_BEARER_TOKEN": req.TWITTER_BEARER_TOKEN
    }
    existing_agent = await agents_db.find_by_api_keys(req.TWITTER_API_KEY, req.TWITTER_API_SECRET_KEY, req.TWITTER_ACCESS_TOKEN, req.TWITTER_ACCESS_TOKEN_SECRET)
    if existing_agent:
        raise HTTPException(status_code=400, detail="Agent already exists")
    try:
        client = tweepy.Client(
            bearer_token=req.TWITTER_BEARER_TOKEN,
            consumer_key=req.TWITTER_API_KEY,
            consumer_secret=req.TWITTER_API_SECRET_KEY,
            access_token=req.TWITTER_ACCESS_TOKEN,
            access_token_secret=req.TWITTER_ACCESS_TOKEN_SECRET,
        )
        client.create_tweet(text=f"Hello world! Agent {client.get_me().data.username} is now active.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error initializing Tweepy client")
    async def get_profile_url():
        auth = tweepy.OAuthHandler(req.TWITTER_API_KEY, req.TWITTER_API_SECRET_KEY)
        auth.set_access_token(req.TWITTER_ACCESS_TOKEN, req.TWITTER_ACCESS_TOKEN_SECRET)
        api = tweepy.API(auth)
        api.update_profile(description="Automated by AgentXHub", name=req.name)
        user = client.get_me()
        if user and user.data:
            return f"https://twitter.com/{user.data.username}"
        return None
    profile_url = await get_profile_url()
    agent_data = {
        "agent_id": agent_id,
        "name": f'@{client.get_me().data.username}',
        "agent_name": req.name,
        "twitter_link": profile_url,
        "personality_prompt": req.personality_prompt,
        "TWITTER_API_KEY": req.TWITTER_API_KEY,
        "TWITTER_API_SECRET_KEY": req.TWITTER_API_SECRET_KEY,
        "TWITTER_ACCESS_TOKEN": req.TWITTER_ACCESS_TOKEN,
        "TWITTER_ACCESS_TOKEN_SECRET": req.TWITTER_ACCESS_TOKEN_SECRET,
        "TWITTER_BEARER_TOKEN": req.TWITTER_BEARER_TOKEN,
        "created_at": datetime.utcnow().isoformat()
    }
    await agents_db.insert(agent_data)
    try:
        schedule_daily_tweet_job(agent_id, req.personality_prompt, credentials)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error scheduling daily tweet")
    try:
        mentions_job_id = f"mentions_agent_id:{agent_id}"
        scheduler.add_job(
            execute_mentions_reply,
            trigger=IntervalTrigger(minutes=10),
            args=[agent_id, credentials, os.getenv("OPENAI_API_KEY")],
            id=mentions_job_id,
            replace_existing=False,
            max_instances=1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error scheduling mentions reply job")
    return {"agent_id": agent_id, "message": "Agent created successfully"}

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Twitter Automation API"}

@app.get("/jobs")
async def list_jobs():
    jobs = scheduler.get_jobs()
    job_list = []
    for j in jobs:
        job_list.append({
            "id": j.id,
            "name": j.name,
            "trigger": str(j.trigger),
            "next_run_time": j.next_run_time.isoformat() if j.next_run_time else None
        })
    return {"jobs": job_list}

@app.get("/agents")
async def list_agents():
    agents = await agents_db.get_all()
    sanitized_agents = []
    for agent in agents:
        sanitized_agents.append({
            "id": agent.get("agent_id"),
            "agent_name": agent.get("agent_name"),
            "twitter_link": agent.get("twitter_link"),
            "personality": agent.get("personality_prompt"),
            "name": agent.get("name")
        })
    return {"agents": sanitized_agents}

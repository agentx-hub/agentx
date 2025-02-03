import logging

logger = logging.getLogger(__name__)

class GenerateCreativeTweetsTask:
    def __init__(self, agent, personality_prompt: str):
        self.agent = agent
        self.personality_prompt = personality_prompt
    def execute(self) -> str:
        tweet = self.agent.generate_tweet(self.personality_prompt)
        logger.debug(f"GenerateCreativeTweetsTask: {tweet}")
        return tweet

class GenerateAdvancedCreativeTweetsTask:
    def __init__(self, agent, personality_prompt: str):
        self.agent = agent
        self.personality_prompt = personality_prompt
    def execute(self) -> str:
        tweet = self.agent.generate_advanced_tweet(self.personality_prompt)
        logger.debug(f"GenerateAdvancedCreativeTweetsTask: {tweet}")
        return tweet

class PublishTweetsTask:
    def __init__(self, agent, tweet_text: str):
        self.agent = agent
        self.tweet_text = tweet_text
    def execute(self) -> bool:
        result = self.agent.post_tweet(self.tweet_text)
        logger.debug(f"PublishTweetsTask: Result {result}")
        return result

class PlanningTask:
    def __init__(self, agent, task_name: str):
        self.agent = agent
        self.task_name = task_name
    def execute(self):
        self.agent.schedule_task(self.task_name)
        logger.debug("PlanningTask executed.")

class ReschedulingTask:
    def __init__(self, agent, task_name: str):
        self.agent = agent
        self.task_name = task_name
    def execute(self):
        self.agent.reschedule_task(self.task_name)
        logger.debug("ReschedulingTask executed.")

class CheckTweetTask:
    def __init__(self, agent, tweet_id: str):
        self.agent = agent
        self.tweet_id = tweet_id
    def execute(self) -> str:
        status = self.agent.check_tweet_status(self.tweet_id)
        logger.debug(f"CheckTweetTask: Status {status}")
        return status

class EngagementAnalysisTask:
    def __init__(self, agent, tweet_text: str):
        self.agent = agent
        self.tweet_text = tweet_text
    def execute(self) -> dict:
        analysis = self.agent.analyze_engagement(self.tweet_text)
        logger.debug(f"EngagementAnalysisTask: Analysis {analysis}")
        return analysis

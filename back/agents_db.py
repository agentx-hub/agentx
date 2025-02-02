from db import db

class AgentsDB:
    def __init__(self):
        self.collection = db.agents

    async def insert(self, data: dict):
        result = await self.collection.insert_one(data)
        return result.inserted_id

    async def get_all(self):
        agents = []
        cursor = self.collection.find()
        async for document in cursor:
            agents.append(document)
        return agents

    async def find_by_api_keys(self, api_key, api_secret_key, access_token, access_token_secret):
        document = await self.collection.find_one({
            "TWITTER_API_KEY": api_key,
            "TWITTER_API_SECRET_KEY": api_secret_key,
            "TWITTER_ACCESS_TOKEN": access_token,
            "TWITTER_ACCESS_TOKEN_SECRET": access_token_secret
        })
        return document

agents_db = AgentsDB()

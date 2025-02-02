from db import db

class Database:
    def __init__(self):
        self.collection = db.mentions

    async def insert(self, data: dict):
        result = await self.collection.insert_one(data)
        return result.inserted_id

    async def get_all(self):
        records = []
        cursor = self.collection.find()
        async for document in cursor:
            records.append(document)
        return records

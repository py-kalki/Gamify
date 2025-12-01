from peewee import *
import datetime
import json

db = SqliteDatabase('gamify.db')

class JSONField(TextField):
    def db_value(self, value):
        return json.dumps(value)

    def python_value(self, value):
        if value is not None:
            return json.loads(value)
        return {}

class BaseModel(Model):
    class Meta:
        database = db

class Bucket(BaseModel):
    id = CharField(primary_key=True)
    type = CharField()
    client = CharField()
    hostname = CharField()
    created = DateTimeField(default=datetime.datetime.now)

class Event(BaseModel):
    bucket = ForeignKeyField(Bucket, backref='events')
    timestamp = DateTimeField()
    duration = FloatField(default=0.0)
    data = JSONField()

def init_db():
    db.connect()
    db.create_tables([Bucket, Event])

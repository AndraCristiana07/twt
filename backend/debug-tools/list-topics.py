
from confluent_kafka.admin import AdminClient, NewTopic

admin = AdminClient({
    'bootstrap.servers': 'localhost:9092'
})

admin.create_topics([NewTopic("aaaa")])

topics = admin.list_topics().topics

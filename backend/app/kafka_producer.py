from confluent_kafka import Producer
import json

from app.models import User

config = {
    'bootstrap.servers': 'kafka:9092'
}

def delivery_report(err, msg):
    print('2')
    if err is not None:
        print(f"Message delivery failed: {err}")
    else:
        print(f"Message delivered to {msg.topic()} [{msg.partition()}]")

def follow_user(follower: User, following: User):
    
    message = {
        'follower': follower.pk,
        'following': following.pk
    }

    print(message)    
        
    producer = Producer(config)
    producer.produce('follow_notification', value=json.dumps(message).encode('utf-8'), callback=delivery_report)
    producer.flush()
    
    print('1')

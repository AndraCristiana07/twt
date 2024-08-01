from confluent_kafka import Producer
import json
import socket
import time


# def main():
#     # producer.produce('mytopic', value = json.dumps({'message': 'Hello World!'}).encode('utf-8'))
#     for i in range(100):
#         producer.produce('follow_notification', value = json.dumps({'message': f'Hello World! {i}'}).encode('utf-8'))
#         time.sleep(1)
#     producer.flush()
 
# if __name__ == "__main__":
#     main()
config = {
    'bootstrap.servers': 'kafka:9092'
}
# producer = None

# def follow_user(follower, following):
#     message = {
#         'follower': follower,
#         'following': following
#     }
#     producer.produce('follow_notification', value = json.dumps(message).encode('utf-8'))
#     producer.flush()    
producer = Producer(config)

def delivery_report(err, msg):
    if err is not None:
        print(f"Message delivery failed: {err}")
    else:
        print(f"Message delivered to {msg.topic()} [{msg.partition()}]")

def follow_user(follower, following):
    message = {
        'follower': follower,
        'following': following
    }
    producer.produce('follow_notification', value=json.dumps(message).encode('utf-8'), callback=delivery_report)
    producer.flush()
    
# conf = {
#     'bootstrap.servers': 'kafka:9092',
#     'client.id': "plang"
# }
# while True:
#     try:
#         producer = Producer(conf)
#         break
#     except Exception:
#         pass

 # topic = 'mytopic'
# def publish(message):
#     try:
#         producer.produce(topic, value = json.dumps(message).encode('utf-8'))
#         producer.flush()
#     except Exception as e:
#         print('Error: ', e)       
    
# def send_follow_notification(follower, following):
#     message = {
#         'follower': follower,
#         'following': following
#     }
#     producer.produce('follow_notification', value = json.dumps(message).encode('utf-8'))
#     producer.flush()

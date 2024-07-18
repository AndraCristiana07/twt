from confluent_kafka import Consumer
import json
import asyncio

# def main():
#     consumer = Consumer({
#         'bootstrap.servers': '10.0.0.9:9092',
#         'group.id': 'my-group',
#         'auto.offset.reset': 'earliest'
#     })

#     consumer.subscribe(['follow_notification'])

#     while True:
#         msg = consumer.poll(timeout=1.0)

#         if msg is None:
#             continue
#         if msg.error():
#             print("Consumer error: {}".format(msg.error()))
#             continue
        
#         print('Received message: {}'.format(msg.value().decode('utf-8')))


# if __name__ == "__main__":
#     main()

        # notification = json.loads(msg.value().decode('utf-8'))
#         print(f"New follow: {notification['follower']} is following {notification['following']}")

config = {
    'bootstrap.servers': '10.0.0.9:9092',
    'group.id': 'my-group',
    'auto.offset.reset': 'earliest'
}

async def consume_notifications():
    while True:
        msg = consumer.poll()

        if msg.error():
            print("Consumer error: {}".format(msg.error()))
            continue

        # print('Received message: {}'.format(msg.value().decode('utf-8')))
        notification = json.loads(msg.value().decode('utf-8'))
        print(f"New follow: {notification['follower']} is following {notification['following']}")


while True:
    try:
        consumer = Consumer(config)
        break
    except Exception:
        pass
consumer.subscribe(['follow_notification'])
asyncio.run(consume_notifications())

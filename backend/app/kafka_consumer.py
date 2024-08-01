from confluent_kafka import Consumer, KafkaError
import json
import asyncio

# def main():
#     consumer = Consumer({
#         'bootstrap.servers': 'kafka:9092',
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
    'bootstrap.servers': 'kafka:9092',
    'group.id': 'my-group',
    'auto.offset.reset': 'earliest'
}

async def consume_notifications():
#     while True:
#         msg = consumer.poll()

#         if msg.error():
#             print("Consumer error: {}".format(msg.error()))
#             continue

#         # print('Received message: {}'.format(msg.value().decode('utf-8')))
#         notification = json.loads(msg.value().decode('utf-8'))
#         print(f"New follow: {notification['follower']} is following {notification['following']}")


# while True:
#     try:
#         consumer = Consumer(config)
#         break
#     except Exception:
#         pass
# consumer.subscribe(['follow_notification'])
# asyncio.run(consume_notifications())

    consumer = Consumer(config)
    consumer.subscribe(['follow_notification'])

    try:
        while True:
            msg = consumer.poll(timeout=1.0)

            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    print(f"Consumer error: {msg.error()}")
                    break

            notification = json.loads(msg.value().decode('utf-8'))
            print(f"New follow: {notification['follower']} is following {notification['following']}")
    except Exception as e:
        print(f"Exception: {e}")
    finally:
        consumer.close()

asyncio.run(consume_notifications())

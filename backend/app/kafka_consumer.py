# from confluent_kafka import Consumer, KafkaError
# import json
# import asyncio

# async def consume_notifications():
#     consumer = Consumer({
#         'bootstrap.servers': 'kafka:9092',
#         'group.id': 'my-group',
#         'auto.offset.reset': 'earliest'
#     })
#     consumer.subscribe(['follow_notification'])
#     print('consumer_sub')
#     # consumer.topics()
#     try:
#         while True:
#             print("AAA")
#             msg = consumer.poll()
#             print("BBB")
#             print(msg)
            
#             if msg is None:
#                 continue
#             if msg.error():
#                 if msg.error().code() == KafkaError._PARTITION_EOF:
#                     continue
#                 else:
#                     print(f"Consumer error: {msg.error()}")
#                     break

#             notification = json.loads(msg.value().decode('utf-8'))
#             print(f"New follow: {notification['follower']} is following {notification['following']}")
#     except Exception as e:
#         print(f"Exception: {e}")
#     finally:
#         print("finally?")
#         consumer.close()

# # asyncio.run(consume_notifications())

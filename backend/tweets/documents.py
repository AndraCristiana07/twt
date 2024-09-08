# from django_elasticsearch_dsl import Document, Index, fields
# from django_elasticsearch_dsl.registries import registry

# tweet_index = Index('tweets')
# tweet_index.settings(
#     number_of_shards=1,
#     number_of_replicas=0
# )

# @registry.register_document
# class TweetDocument(Document):
#     class Index:
#         name = 'tweets'
#         settings = {
#             'number_of_shards': 1,
#             'number_of_replicas': 0
#         }

#     class Django:
#         pass

#     id = fields.TextField()
#     user_id = fields.TextField()
#     content = fields.TextField()
#     created_at = fields.DateField()

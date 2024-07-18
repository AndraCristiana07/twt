from django.shortcuts import render

# from django.http import JsonResponse
from uuid import uuid4, UUID
from tweets.cassandra_def import get_session
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

# from app.models import Follow, User
# from elasticsearch_dsl.query import MultiMatch
# # from tweets.documents import TweetDocument
# from cassandra.query import SimpleStatement
import logging

logger = logging.getLogger(__name__)

# Create your views here.


def is_valid_uuid(uuid_to_test, version=4):
    try:
        uuid_obj = UUID(uuid_to_test, version=version)
    except ValueError:
        return False
    return str(uuid_obj) == uuid_to_test


class PostTweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        # user_id = request.data['user_id']
        user_id = str(request.user.id)
        content = request.data["content"]

        # print(user_id)
        # print(type(user_id))
        if not content:
            return Response(
                {"status": "fail", "message": "Content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tweet_id = uuid4()

        session = get_session()
        session.execute(
            """
        INSERT INTO twitter.tweets (id, user_id, created_at, content)
        VALUES (%s, %s, toTimestamp(now()), %s)
        """,
            (tweet_id, user_id, content),
        )

        return Response(
            {"status": "success", "tweet_id": tweet_id}, status=status.HTTP_201_CREATED
        )


# @csrf_exempt
# def get_tweets(request):
#     session = get_session()
#     rows = session.execute("SELECT * FROM twitter.tweets")
#     tweets = [{'id': str(row.id), 'user_id': row.user_id, 'content': row.content, 'created_at': row.created_at} for row in rows]
#     return JsonResponse({'tweets': tweets})


class GetSingleTweetView(APIView):

    def get(self, request, tweet_id):
        user_id = str(request.user.id)
        session = get_session()
        tweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
        )
        tweet = list(tweet)
        # if not tweet:
        # return Response({'status': 'fail', 'message': 'Tweet does not exist' }, status=status.HTTP_400_BAD_REQUEST)
        tweet = tweet[0]
        likes = session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s ALLOW FILTERING",
            (tweet_id,),
        )
        retweets = session.execute(
            "SELECT * FROM twitter.retweets WHERE tweet_id = %s ALLOW FILTERING",
            (tweet_id,),
        )
        comments = session.execute(
            "SELECT * FROM twitter.comments WHERE tweet_id = %s ALLOW FILTERING",
            (tweet_id,),
        )
        username = request.user.username
        return Response(
            {
                "id": str(tweet.id),
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "username": username,
                "likes": [
                    {"id": str(like.id), "user_id": like.user_id} for like in likes
                ],
                "retweets": [
                    {"id": str(retweet.id), "user_id": retweet.user_id}
                    for retweet in retweets
                ],
                "comments": [
                    {
                        "id": str(comment.id),
                        "user_id": comment.user_id,
                        "content": comment.content,
                        "created_at": comment.created_at,
                    }
                    for comment in comments
                ]
            },
            status=status.HTTP_200_OK,
        )


class GetSingleRetweetView(APIView):
    def get(self, request, retweet_id):
        user_id = str(request.user.id)
        session = get_session()
        retweet = session.execute(
            "SELECT * FROM twitter.retweets WHERE id = %s ALLOW FILTERING",
            (retweet_id,),
        )
        retweet = list(retweet)
        if not retweet:
            return Response(
                {"status": "fail", "message": "Retweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        retweet = retweet[0]
        likes = session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s ALLOW FILTERING",
            (retweet_id,),
        )
        retweets = session.execute(
            "SELECT * FROM twitter.retweets WHERE tweet_id = %s ALLOW FILTERING",
            (retweet_id,),
        )
        comments = session.execute(
            "SELECT * FROM twitter.comments WHERE tweet_id = %s ALLOW FILTERING",
            (retweet_id,),
        )

        username = request.user.username
        return Response(
            {
                "id": str(retweet.id),
                "user_id": retweet.user_id,
                "tweet_id": retweet.tweet_id,
                "created_at": retweet.created_at,
                "username": username,
                "likes": [
                    {"id": str(like.id), "user_id": like.user_id} for like in likes
                ],
                "retweets": [
                    {"id": str(retweet.id), "user_id": retweet.user_id}
                    for retweet in retweets
                ],
                "comments": [
                    {
                        "id": str(comment.id),
                        "user_id": comment.user_id,
                        "content": comment.content,
                        "created_at": comment.created_at,
                    }
                    for comment in comments
                ],
            },
            status=status.HTTP_200_OK,
        )


# class GetTweetsView(APIView):
#     # permission_classes = (IsAuthenticated,)
#     def get(self, request):
#         session = get_session()
#         rows = session.execute("SELECT * FROM twitter.tweets")

#         user_ids = [row.user_id for row in rows]

#         users = User.objects.filter(id__in=user_ids)
#         user_dict = {str(user.id): user.username for user in users}

#         tweets = []
#         for row in rows:
#             tweet = {
#                 'id': str(row.id),
#                 'user_id': row.user_id,
#                 'username': user_dict.get(str(row.user_id), 'Unknown'),
#                 'content': row.content,
#                 'created_at': row.created_at
#             }
#             tweets.append(tweet)

#         return Response({'tweets': tweets}, status=status.HTTP_200_OK)

# @csrf_exempt
# def delete_tweet(request, tweet_id):
#     session = get_session()
#     session.execute("DELETE FROM twitter.tweets WHERE id = %s", (tweet_id,))
#     return JsonResponse({'status': 'success'})


class DeleteTweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, tweet_id):
        session = get_session()

        tweet_exists = session.execute(
            "SELECT id FROM twitter.tweets WHERE id = %s", (tweet_id,)
        )
        if not tweet_exists:
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        likes_to_del = session.execute(
            "SELECT id FROM twitter.likes WHERE tweet_id = %s ALLOW FILTERING",
            (tweet_id,),
        )
        for like in likes_to_del:
            session.execute("DELETE FROM twitter.likes WHERE id = %s", (like.id,))

        # retweets_to_del = session.execute("SELECT id FROM twitter.retweets WHERE tweet_id = %s ALLOW FILTERING", (tweet_id,))
        # for retweet in retweets_to_del:
        #     session.execute("DELETE FROM twitter.retweets WHERE id = %s", (retweet.id,))

        session.execute("DELETE FROM twitter.tweets WHERE id = %s", (tweet_id,))

        return Response({"status": "success"}, status=status.HTTP_200_OK)


class LikeTweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, tweet_id):
        user_id = str(request.user.id)
        session = get_session()

        # if tweet doesn't exist
        if not session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s", (tweet_id,)
        ):
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        like_id = uuid4()

        # if user already liked the tweet
        if session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (tweet_id, user_id),
        ):
            return Response(
                {"status": "fail", "message": "You have already liked this tweet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute(
            """
        INSERT INTO twitter.likes (id, tweet_id, user_id, created_at)
        VALUES (%s, %s, %s, toTimestamp(now()))
        """,
            (like_id, tweet_id, user_id),
        )

        return Response(
            {"status": "success", "like_id": str(like_id)},
            status=status.HTTP_201_CREATED,
        )


class UnlikeTweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, like_id):
        user_id = str(request.user.id)
        # like_id = request.data.get('like_id')
        tweet_id = request.data.get("tweet_id")
        session = get_session()

        # if like doesn't exist
        if not session.execute("SELECT * FROM twitter.likes WHERE id = %s", (like_id,)):
            return Response(
                {"status": "fail", "message": "Like does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute("DELETE FROM twitter.likes WHERE id = %s ", (like_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class PostCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, tweet_id):
        user_id = str(request.user.id)
        content = request.data["content"]
        comment_id = uuid4()

        session = get_session()

        # if tweet doesn't exist
        if not session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s", (tweet_id,)
        ):
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not content:
            return Response(
                {"status": "fail", "message": "Content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute(
            """
        INSERT INTO twitter.comments (id, tweet_id,user_id, content, created_at)
        VALUES (%s, %s, %s, %s, toTimestamp(now()))
        """,
            (comment_id, tweet_id, user_id, content),
        )

        return Response(
            {"status": "success", "comment_id": str(comment_id)},
            status=status.HTTP_201_CREATED,
        )


class PostCommentonComment(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, comment_id):
        user_id = str(request.user.id)
        content = request.data["content"]
        comment_in_db_id = uuid4()

        session = get_session()

        # if comment doesn't exist
        if not session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        ):
            return Response(
                {"status": "fail", "message": "Comment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not content:
            return Response(
                {"status": "fail", "message": "Content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute(
            """
        INSERT INTO twitter.comments (id, tweet_id,user_id, content, created_at)
        VALUES (%s, %s, %s, %s, toTimestamp(now()))
        """,
            (comment_in_db_id, comment_id, user_id, content),
        )

        return Response(
            {"status": "success", "comment_id": str(comment_id)},
            status=status.HTTP_201_CREATED,
        )


class GetCommentsView(APIView):
    def get(self, request, tweet_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.comments WHERE tweet_id = %s ALLOW FILTERING",
            (tweet_id,),
        )
        comments = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "content": row.content,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"comments": comments}, status=status.HTTP_200_OK)


class GetSingleCommentView(APIView):
    def get(self, request, comment_id):
        session = get_session()
        comment = session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s ALLOW FILTERING",
            (comment_id,),
        )
        
        comment = list(comment)
        if not comment:
            return Response(
                {"status": "fail", "message": "Comment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        comment = comment[0]

        likes = session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s ALLOW FILTERING",
            (comment_id,),
        )
        retweets = session.execute(
            "SELECT * FROM twitter.retweets WHERE tweet_id = %s ALLOW FILTERING",
            (comment_id,),
        )
        comments = session.execute(
            "SELECT * FROM twitter.comments WHERE tweet_id = %s ALLOW FILTERING",
            (comment_id,),
        )
        return Response(
            {
                "id": str(comment.id),
                "tweet_id": comment.tweet_id,
                "user_id": comment.user_id,
                "content": comment.content,
                "created_at": comment.created_at,
                "likes": [ # nu
                    {"id": str(like.id), "user_id": like.user_id} for like in likes
                ],
                "retweets": [ # nu
                    {"id": str(retweet.id), "user_id": retweet.user_id}
                    for retweet in retweets
                ],
                "comments": [ # nu
                    {
                        "id": str(comm.id),
                        "user_id": comm.user_id,
                        "content": comm.content,
                        "created_at": comm.created_at,
                    }
                    for comm in comments
                ],
            },
            status=status.HTTP_200_OK,
        )


# class GetSingleCommentView(APIView):
#     def get(self, request, comment_id):
#         session = get_session()
#         comment = session.execute("SELECT * FROM twitter.comments WHERE id = %s ALLOW FILTERING", (uuid4.UUID(comment_id),))
#         if not comment:
#             return Response({'status': 'fail', 'message': 'Comment does not exist'}, status=status.HTTP_400_BAD_REQUEST)
#         comment = comment[0]

#         likes = session.execute("SELECT * FROM twitter.likes WHERE tweet_id = %s ALLOW FILTERING", (uuid4.UUID(comment_id),))
#         retweets = session.execute("SELECT * FROM twitter.retweets WHERE tweet_id = %s ALLOW FILTERING", (uuid4.UUID(comment_id),))
#         comments = session.execute("SELECT * FROM twitter.comments WHERE tweet_id = %s ALLOW FILTERING", (uuid4.UUID(comment_id),))

#         return Response({
#             'id': str(comment.id),
#             'tweet_id': comment.tweet_id,
#             'user_id': comment.user_id,
#             'content': comment.content,
#             'created_at': comment.created_at,
#             'likes': [{'id': str(like.id), 'user_id': like.user_id} for like in likes],
#             'retweets': [{'id': str(retweet.id), 'user_id': retweet.user_id} for retweet in retweets],
#             'comments': [{'id': str(comm.id), 'user_id': comm.user_id, 'content': comm.content, 'created_at': comm.created_at} for comm in comments]
#         }, status=status.HTTP_200_OK)


class DeleteAllLikes(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request):
        session = get_session()

        session.execute("DELETE FROM twitter.likes")
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class DeleteCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, comment_id):
        session = get_session()

        # if comment doesn't exist
        if not session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        ):
            return Response(
                {"status": "fail", "message": "Comment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # if likes exist for the comment, delete them
        likes_to_del = session.execute(
            "SELECT id FROM twitter.likes WHERE tweet_id = %s ALLOW FILTERING",
            (comment_id,),
        )
        for like in likes_to_del:
            session.execute("DELETE FROM twitter.likes WHERE id = %s", (like.id,))

        # if retweets exist for the commwnt, delete them
        retweets_to_del = session.execute(
            "SELECT id FROM twitter.retweets WHERE tweet_id = %s ALLOW FILTERING",
            (comment_id,),
        )
        for retweet in retweets_to_del:
            session.execute("DELETE FROM twitter.retweets WHERE id = %s", (retweet.id,))

        session.execute("DELETE FROM twitter.comments WHERE id = %s", (comment_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class LikeCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, comment_id):
        user_id = str(request.user.id)
        session = get_session()

        # if comment doesn't exist
        if not session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        ):
            return Response(
                {"status": "fail", "message": "Comment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        like_id = uuid4()
        # if user already liked the comment
        if session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (comment_id, user_id),
        ):
            return Response(
                {"status": "fail", "message": "You have already liked this comment"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute(
            """
        INSERT INTO twitter.likes (id, tweet_id, user_id, created_at)
        VALUES (%s, %s, %s, toTimestamp(now()))
        """,
            (like_id, comment_id, user_id),
        )

        return Response(
            {"status": "success", "like_id": str(like_id)},
            status=status.HTTP_201_CREATED,
        )


class UnlikeCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, like_id):
        user_id = str(request.user.id)
        comment_id = request.data.get("comment_id")
        session = get_session()

        # if like doesn't exist
        if not session.execute("SELECT * FROM twitter.likes WHERE id = %s", (like_id,)):
            return Response(
                {"status": "fail", "message": "Like does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute("DELETE FROM twitter.likes WHERE id = %s ", (like_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class RetweetCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, comment_id):
        user_id = str(request.user.id)
        retweet_id = uuid4()

        session = get_session()

        # if comment doesn't exist
        if not session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        ):
            return Response(
                {"status": "fail", "message": "Comment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # if user already retweeted
        if session.execute(
            "SELECT * FROM twitter.retweets WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (comment_id, user_id),
        ):
            return Response(
                {
                    "status": "fail",
                    "message": "You have already retweeted this comment",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute(
            """
        INSERT INTO twitter.retweets (id, tweet_id,user_id, created_at)
        VALUES (%s, %s, %s, toTimestamp(now()))
        """,
            (retweet_id, comment_id, user_id),
        )

        return Response(
            {"status": "success", "retweet_id": str(retweet_id)},
            status=status.HTTP_201_CREATED,
        )


class GetCommentsForComment(APIView):
    def get(self, request, comment_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.comments WHERE comment_id = %s ALLOW FILTERING",
            (comment_id,),
        )
        comments = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "content": row.content,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"comments": comments}, status=status.HTTP_200_OK)


class GetAllLikesView(APIView):
    def get(self, request):
        session = get_session()
        rows = session.execute("SELECT * FROM twitter.likes ")
        likes = [
            {
                "id": str(row.id),
                "tweet_id": row.comment_id,
                "user_id": row.user_id,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"likes": likes}, status=status.HTTP_200_OK)


class GetLikesPerTweetView(APIView):
    def get(self, request, tweet_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s ALLOW FILTERING",
            (tweet_id,),
        )
        likes = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"likes": likes}, status=status.HTTP_200_OK)


# class GetLikesPerCommentView(APIView):
#     def get(self, request, comment_id):
#         session = get_session()
#         rows = session.execute("SELECT * FROM twitter.likes WHERE tweet_id = %s ALLOW FILTERING", (comment_id,))
#         likes = [{'id': str(row.id), 'tweet_id': row.tweet_id,'user_id': row.user_id, 'created_at': row.created_at} for row in rows]
#         return Response({'likes': likes}, status=status.HTTP_200_OK)


class RetweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, tweet_id):
        user_id = str(request.user.id)
        retweet_id = uuid4()

        session = get_session()

        # if tweet doesn't exist
        if not session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s", (tweet_id,)
        ):
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # if user alreadt retweeted
        if session.execute(
            "SELECT * FROM twitter.retweets WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (tweet_id, user_id),
        ):
            return Response(
                {"status": "fail", "message": "You have already retweeted this tweet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute(
            """
        INSERT INTO twitter.retweets (id, tweet_id, user_id, created_at)
        VALUES (%s, %s, %s, toTimestamp(now()))
        """,
            (retweet_id, tweet_id, user_id),
        )

        return Response(
            {"status": "success", "retweet_id": str(retweet_id)},
            status=status.HTTP_201_CREATED,
        )


class DeleteRetweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, retweet_id):
        session = get_session()

        # if retweet doesn't exist
        if not session.execute(
            "SELECT * FROM twitter.retweets WHERE id = %s", (retweet_id,)
        ):
            return Response(
                {"status": "fail", "message": "Retweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute("DELETE FROM twitter.retweets WHERE id = %s", (retweet_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class GetRetweetsView(APIView):
    def get(self, request, tweet_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.retweets WHERE tweet_id = %s ALLOW FILTERING",
            (tweet_id,),
        )
        retweets = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"retweets": retweets}, status=status.HTTP_200_OK)


class GetUserTweetsView(APIView):
    # permission_classes = (IsAuthenticated,)
    def get(self, request, user_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.tweets WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        tweets = [
            {
                "id": str(row.id),
                "user_id": row.user_id,
                "content": row.content,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"tweets": tweets}, status=status.HTTP_200_OK)


class GetUserCommentsView(APIView):
    def get(self, request, user_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.comments WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        comments = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "content": row.content,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"comments": comments}, status=status.HTTP_200_OK)


class GetUserLikesView(APIView):
    def get(self, request, user_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.likes WHERE user_id = %s ALLOW FILTERING", (user_id,)
        )
        likes = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"likes": likes}, status=status.HTTP_200_OK)


class GetUserRetweetsView(APIView):
    def get(self, request, user_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.retweets WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        retweets = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"retweets": retweets}, status=status.HTTP_200_OK)


# class FollowUserView(APIView):
#     permission_classes = (IsAuthenticated,)

#     def post(self, request, following_id):
#         session = get_session()

#         user_id = str(request.user.id)
#         follow_id = uuid4()

#         #verify if following_id is a user_id
#         if not session.execute("SELECT * FROM twitter.users WHERE id = %s", (following_id,)):
#             return Response({'status': 'fail', 'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
#         #verify if user is not following himself
#         if user_id == following_id:
#             return Response({'status': 'fail', 'message': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
#         #verify if user is already following the user
#         if session.execute("SELECT * FROM twitter.followings WHERE user_id = %s AND following_id = %s", (user_id, following_id)):
#             return Response({'status': 'fail', 'message': 'You are already following this user'}, status=status.HTTP_400_BAD_REQUEST)


#         session.execute("""
#         INSERT INTO twitter.followings (id, user_id,following_id,created_at)
#         VALUES (%s, %s, %s, toTimestamp(now()))
#         """, (follow_id, user_id,following_id))
#         return Response({'status': 'success', 'follow_id': str(follow_id)}, status=status.HTTP_201_CREATED)


# class FriendsTimelineView(APIView):
#     permission_classes = (IsAuthenticated,)

#     def get(self, request):
#         user_id = str(request.user.id)
#         session = get_session()

#         followings = Follow.objects.filter(follower_id=user_id).values_list('following_id')
#         followings_ids = list(followings)

#         tweets = []
#         for following_id in followings_ids:
#             rows = session.execute("SELECT * FROM twitter.tweets WHERE user_id = %s ORDER BY created_at DESC ALLOW FILTERING", (str(following_id),))

#         for row in rows:
#             tweets.append({'id': str(row.id), 'user_id': row.user_id, 'created_at': row.created_at, 'content': row.content})

#         return Response({'tweets': tweets}, status=status.HTTP_200_OK)

# class FriendsTimelineView(APIView):
#     permission_classes = (IsAuthenticated,)

#     def get(self, request):
#         user = request.user
#         following_users = user.get_following()
#         # following_ids = [str(user.id) for user in following_users]
#         following_ids = [str(follow.followed.id) for follow in following_users]
#         following_ids.append(str(user.id))
#         print(f"Following IDs: {following_ids}")

#         if not following_ids:
#             return Response({'message': 'No following users found'}, status=status.HTTP_404_NOT_FOUND)

#         session = get_session()

#         # return Response(timeline, status=status.HTTP_200_OK)
#         followings_list = ', '.join(['%s'] * len(following_ids))
#         query = f"SELECT * FROM twitter.tweets WHERE user_id IN ({followings_list}) ALLOW FILTERING"
#         # query = f"SELECT * FROM twitter.tweets WHERE user_id IN ({followings_list}) ORDER BY created_at DESC  ALLOW FILTERING"

#         tweets = session.execute(query, following_ids)

#         # for following_id in following_ids:
#         #     tweets = session.execute("SELECT * FROM twitter.tweets WHERE user_id = %s IN ALLOW FILTERING" % following_id)
#         #                             #   ORDER BY created_at DESC ALLOW FILTERING", (str(following_id),))

#         timeline = []
#         for tweet in tweets:
#             timeline.append({
#                 'id': tweet.id,
#                 'user_id': tweet.user_id,
#                 'content': tweet.content,
#                 'created_at': tweet.created_at
#             })

#         print(f"Retrieved tweets: {timeline}")
#         return Response(timeline, status=status.HTTP_200_OK)


class FriendsTimelineView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        following_users = user.get_following()
        following_ids = [str(follow.followed.id) for follow in following_users]
        following_ids.append(str(user.id))
        print(f"Following IDs: {following_ids}")

        if not following_ids:
            return Response(
                {"message": "No following users found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        session = get_session()
        followings_list = ", ".join(["%s"] * len(following_ids))
        query = f"SELECT * FROM twitter.tweets WHERE user_id IN ({followings_list}) ALLOW FILTERING"

        tweets = session.execute(query, following_ids)

        timeline = []
        for tweet in tweets:
            timeline.append(
                {
                    "id": tweet.id,
                    "user_id": tweet.user_id,
                    "content": tweet.content,
                    "created_at": tweet.created_at,
                }
            )

        print(f"Retrieved tweets: {timeline}")
        return Response({"tweets": timeline}, status=status.HTTP_200_OK)


class UserTimelineView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        session = get_session()
        # logger.info("aaaaaa")
        user_id = str(request.user.id)
        # logger.info("bbb")
        rows = session.execute(
            "SELECT * FROM twitter.tweets WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        # logger.info("ccc")

        tweets = [
            {
                "id": str(row.id),
                "user_id": row.user_id,
                "created_at": row.created_at,
                "content": row.content,
            }
            for row in rows
        ]
        # logger.info("ddd")
        return Response({"tweets": tweets}, status=status.HTTP_200_OK)


class GetCurrentUserRetweets(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        session = get_session()
        user_id = str(request.user.id)
        rows = session.execute(
            "SELECT * FROM twitter.retweets WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        retweets = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"retweets": retweets}, status=status.HTTP_200_OK)


class GetCurrentUserLikes(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        session = get_session()
        user_id = str(request.user.id)
        rows = session.execute(
            "SELECT * FROM twitter.likes WHERE user_id = %s ALLOW FILTERING", (user_id,)
        )
        likes = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"likes": likes}, status=status.HTTP_200_OK)


class GetCurrentUserComments(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        session = get_session()
        user_id = str(request.user.id)
        rows = session.execute(
            "SELECT * FROM twitter.comments WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        comments = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "content": row.content,
                "created_at": row.created_at,
            }
            for row in rows
        ]
        return Response({"comments": comments}, status=status.HTTP_200_OK)


class CreateBookmarkView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, tweet_id):
        session = get_session()
        user_id = str(request.user.id)
        bookmark_id = uuid4()

        tweet_exists = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s", (tweet_id,)
        )
        if not tweet_exists:
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        already_bookmarked = session.execute(
            "SELECT * FROM twitter.bookmarks WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (tweet_id, user_id),
        )
        if already_bookmarked:
            return Response(
                {"status": "fail", "message": "You have already bookmarked this tweet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute(
            """
        INSERT INTO twitter.bookmarks (id, tweet_id, user_id, created_at)
        VALUES (%s, %s, %s, toTimestamp(now()))
        """,
            (bookmark_id, tweet_id, user_id),
        )

        return Response(
            {"status": "success", "bookmark_id": str(bookmark_id)},
            status=status.HTTP_201_CREATED,
        )


class CreateCommentBookmarkView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, comment_id):
        session = get_session()
        user_id = str(request.user.id)
        bookmark_id = uuid4()

        comment_exists = session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        )
        if not comment_exists:
            return Response(
                {"status": "fail", "message": "Comment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        already_bookmarked = session.execute(
            "SELECT * FROM twitter.bookmarks WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (comment_id, user_id),
        )
        if already_bookmarked:
            return Response(
                {
                    "status": "fail",
                    "message": "You have already bookmarked this comment",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute(
            """
        INSERT INTO twitter.bookmarks (id, tweet_id,user_id,created_at)
        VALUES (%s, %s, %s, toTimestamp(now()))
        """,
            (bookmark_id, comment_id, user_id),
        )

        return Response(
            {"status": "success", "bookmark_id": str(bookmark_id)},
            status=status.HTTP_201_CREATED,
        )


class DeleteBookmarkView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, bookmark_id):
        session = get_session()

        bookmark_exists = session.execute(
            "SELECT * FROM twitter.bookmarks WHERE id = %s", (bookmark_id,)
        )
        if not bookmark_exists:
            return Response(
                {"status": "fail", "message": "Bookmark does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.execute("DELETE FROM twitter.bookmarks WHERE id = %s", (bookmark_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class GetUserBookmarksView(APIView):
    def get(self, request, user_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.bookmarks WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        bookmarks = [
            {"id": str(row.id), "tweet_id": row.tweet_id, "user_id": row.user_id}
            for row in rows
        ]
        return Response({"bookmarks": bookmarks}, status=status.HTTP_200_OK)


# class SearchTweetView(APIView):
#     def get(self, request):
#         q = request.GET.get('q')
#         if not q:
#             return Response({'error': 'Query parameter "q" is required'}, status=status.HTTP_400_BAD_REQUEST)
#         session = get_session()
#         query = MultiMatch(query=q, fields=['content'], type='phrase_prefix')
#         search = TweetDocument.search().query(query)
#         response = search.execute()
#         tweets = []
#         for hit in response:
#             tweets.append({
#                 'id': hit.id,
#                 'user_id': hit.user_id,
#                 'content': hit.content,
#                 'created_at': hit.created_at
#             })

#         return Response({'tweets': tweets}, status=status.HTTP_200_OK)

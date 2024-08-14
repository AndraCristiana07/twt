from django.shortcuts import render

from uuid import uuid4, UUID
from tweets.cassandra_def import get_session
from rest_framework.permissions import IsAuthenticated, BasePermission, AllowAny
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from app.models import User
from app.serializer import UserSerializer
import logging
import requests
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

logger = logging.getLogger(__name__)

# Create your views here.

def is_valid_uuid(uuid_to_test, version=4):
    try:
        uuid_obj = UUID(uuid_to_test, version=version)
    except ValueError:
        return False
    return str(uuid_obj) == uuid_to_test

class PostTweetView(APIView):
    permission_classes = [IsAuthenticated]
    
    def __init__(self):
        logger.debug(self.authentication_classes)
        logger.debug(self.permission_classes)
        pass

    def post(self, request: Request) -> Response:
        # TODO de obicei din jwt se extrage direct user-ul
        # clasa rest_framework_simplejwt > authentication > JWTAuthentication 
        # efectiv are metoda de 'get_user' 
        # https://django-rest-framework-simplejwt.readthedocs.io/en/latest/rest_framework_simplejwt.html#rest_framework_simplejwt.authentication.JWTAuthentication
        user_id = str(request.user.id) 

        content = request.data.get("content")
        images = request.FILES.getlist("images")
        
        tweet_id = uuid4()
        
        session = get_session()
        if len(images) > 4:
            return Response(
                {"status": "fail", "message": "You can upload a maximum of 4 images"},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        if not content and not images:
            return Response(
                {"status": "fail", "message": "Content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        

        image_urls = []
        if images:            
            for image in images:
                image_url = self.upload_image_to_seaweedfs(image, tweet_id)
                image_urls.append(image_url)
          
       
        
        session.execute(
            """
        INSERT INTO twitter.tweets (id, user_id, created_at, content, retweet_id, image_urls, likes, comments, retweets)
        VALUES (%s, %s, toTimestamp(now()), %s, %s, %s, 0, 0, 0)
        """,
            (tweet_id, user_id, content, None, image_urls)
        )

        return Response(
            {"status": "success", "tweet_id": tweet_id}, status=status.HTTP_201_CREATED
        )

    def upload_image_to_seaweedfs(self, image: InMemoryUploadedFile, tweet_id):
        url = f"http://seaweedfsfiler:8888/tweets/{tweet_id}/{image.name}"
        path = f"/tweets/{tweet_id}/{image.name}"
        file = {"file": image.file}
        response = requests.post(url, files=file)
        if response.status_code == 201:
            return path

        else:
            return Exception("Failed to upload image to SeaweedFS")
    
    
class GetSingleTweetView(APIView):

    def get(self, request, tweet_id):
        user_id = str(request.user.id)
        session = get_session()

        tweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
        ).one()
        
        if not tweet:
            return Response({'status': 'fail', 'message': 'Tweet does not exist' }, status=status.HTTP_400_BAD_REQUEST)
        
        isLiked = session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (tweet_id, user_id),
        ).one()
        
        isRetweeted = session.execute(
            "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
            (tweet_id, user_id),
        ).one()
        
        like = session.execute(
            "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (tweet_id, user_id),
        ).one()
        like_id = str(like.id) if like else None
        
        retweet = session.execute(
            "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
            (tweet_id, user_id),
        ).one()
        delete_retweet_id = str(retweet.id) if retweet else None
        
        try:
            user = User.objects.get(id=tweet.user_id)
        except User.DoesNotExist:
            return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(user)
        username = serializer.data['username']
        
        result = session.execute(
            "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
        ).one()
        
        if result is not None and result.retweet_id is not None:
            original_tweet_id = result.retweet_id
            original_tweet = session.execute(
                "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (original_tweet_id,)
            ).one()
            try:
                user = User.objects.get(id=original_tweet.user_id)
            except User.DoesNotExist:
                return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserSerializer(user)
            original_tweet_username = serializer.data['username']
            
            original_tweet_isLiked = session.execute(
                "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            )
            original_tweet_isRetweeted = session.execute(
                "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            )
            original_tweet_like = session.execute(
                "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            ).one()
            original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None
            original_tweet_retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            ).one()
            original_tweet_delete_retweet_id = str(original_tweet_retweet.id) if retweet else None
               

            return Response(
                {
                    "id": str(tweet.id),
                    "user_id": tweet.user_id,
                    "content": tweet.content,
                    "created_at": tweet.created_at,
                    "retweet_id": tweet.retweet_id,
                    "image_urls": tweet.image_urls,
                    "likes": tweet.likes,
                    "comments": tweet.comments,
                    "retweets": tweet.retweets,
                    "username": username,
                    "isLiked": bool(isLiked),
                    "isRetweeted": bool(isRetweeted),
                    "like_id": like_id,
                    "delete_retweet_id": delete_retweet_id,
                    "original_tweet": {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "delete_retweet_id": original_tweet_delete_retweet_id,
                        "username": original_tweet_username,
                    }
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "id": str(tweet.id),
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
            },
            status=status.HTTP_200_OK,
        )    

class GetSingleRetweetView(APIView):
    def get(self, request, retweet_id):
        user_id = str(request.user.id)
        session = get_session()
        result = session.execute(
            "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (retweet_id,)
        ).one()
        
        if result is None or result.retweet_id is None:
            return Response({"status": "Tweet is not a retweet"}, status=status.HTTP_400_BAD_REQUEST)

        retweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
            (retweet_id,),
        )
        retweet = list(retweet)
        if not retweet:
            return Response(
                {"status": "fail", "message": "Retweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        retweet = retweet[0]
        
        username = request.user.username
        return Response(
            {
                "id": str(retweet.id),
                "user_id": retweet.user_id,
                "created_at": retweet.created_at,
                "content": retweet.content,
                "retweet_id": retweet.retweet_id,
                "image_urls": retweet.image_urls,
                "likes": retweet.likes,
                "comments": retweet.comments,
                "retweets": retweet.retweets,
                "username": username,
              
            },
            status=status.HTTP_200_OK,
        )


class DeleteTweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, tweet_id):
        session = get_session()
        result = session.execute(
            "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
        ).one()
        
        if result is None or result.retweet_id is not None:
            return Response({"status": "Tweet is a retweet"}, status=status.HTTP_400_BAD_REQUEST)

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

    
        session.execute("DELETE FROM twitter.tweets WHERE id = %s", (tweet_id,))

        return Response({"status": "success"}, status=status.HTTP_200_OK)


class LikeTweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, tweet_id):
        user_id = str(request.user.id)
        session = get_session()

        
        tweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s", (tweet_id,)
        ).one()
        # if tweet doesn't exist
        if not tweet:
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        like_id = uuid4()

        
        
        # if not tweet:
        #     return Response(
        #         {"status": "fail", "message": "Tweet does not exist"},
        #         status=status.HTTP_400_BAD_REQUEST,
        #     )
        like = session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (tweet_id, user_id),
        ).one()

        # if user already liked the tweet

        if like:
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

        current_likes = tweet.likes if tweet.likes is not None else 0
        updated_likes = current_likes + 1
        session.execute(
            "UPDATE twitter.tweets SET likes = %s WHERE id = %s", (updated_likes,tweet_id,)
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
        # tweet_id = request.data.get("tweet_id")
        session = get_session()

        # if like doesn't exist
        
        if not session.execute("SELECT * FROM twitter.likes WHERE id = %s", (like_id,)):
            return Response(
                {"status": "fail", "message": "Like does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        tweet_id = session.execute(
            "SELECT tweet_id FROM twitter.likes WHERE id = %s", (like_id,)
        )[0].tweet_id
        tweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s", (tweet_id,)
        ).one()
        if not tweet:
            session.execute("DELETE FROM twitter.likes WHERE id = %s ", (like_id,))
        else:
        
            current_likes = tweet.likes if tweet.likes is not None else 0
            updated_likes = current_likes - 1
            
            session.execute(
                "UPDATE twitter.tweets SET likes = %s WHERE id = %s", (updated_likes,tweet_id,)
            )

            session.execute("DELETE FROM twitter.likes WHERE id = %s ", (like_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class PostCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, tweet_id):
        user_id = str(request.user.id)
        content = request.data.get("content")
        images = request.FILES.getlist("images")
        comment_id = uuid4()
        
     
        
        if len(images) > 4:
            return Response(
                {"status": "fail", "message": "You can upload a maximum of 4 images"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        session = get_session()
        
        tweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s", (tweet_id,)
        ).one()
        # if tweet doesn't exist
        if not tweet:
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not content and not images:
            return Response(
                {"status": "fail", "message": "Content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        image_urls = []
        if images:            
            for image in images:
                image_url = self.upload_image_to_seaweedfs(image, tweet_id)
                image_urls.append(image_url)
          
        session.execute(
            """
        INSERT INTO twitter.comments (id, tweet_id,user_id, content, created_at, retweet_id, image_urls, likes, comments, retweets)
        VALUES (%s, %s, %s, %s, toTimestamp(now()), %s, %s, 0, 0, 0)
        """,
            (comment_id, tweet_id, user_id, content, None, image_urls),
        )
        
        current_comments = tweet.comments if tweet.comments is not None else 0
        updated_comments = current_comments + 1
        
        session.execute("UPDATE twitter.tweets SET comments = %s WHERE id = %s", (updated_comments,tweet_id))

        return Response(
            {"status": "success", "comment_id": str(comment_id)},
            status=status.HTTP_201_CREATED,
        )
    def upload_image_to_seaweedfs(self, image: InMemoryUploadedFile, comment_id):
        url = f"http://seaweedfsfiler:8888/tweets/{comment_id}/{image.name}"
        path = f"/tweets/{comment_id}/{image.name}"
        file = {"file": image.file}
        response = requests.post(url, files=file)
        if response.status_code == 201:
            # return response.json()["fileId"]
            return path

        else:
            return Exception("Failed to upload image to SeaweedFS")

class PostCommentonComment(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, comment_id):
        user_id = str(request.user.id)
        content = request.data["content"]
        comment_in_db_id = uuid4()
        likes = 0
        comments = 0
        retweets = 0
        session = get_session()

        comment = session.execute("SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)).one()
        
        # if comment doesn't exist
        if not comment:
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
        INSERT INTO twitter.comments (id, tweet_id,user_id, content, created_at, retweet_id, likes, comments, retweets)
        VALUES (%s, %s, %s, %s, toTimestamp(now()), %s, %s, %s, %s )
        """,
            (comment_in_db_id, comment_id, user_id, content, None, likes, comments, retweets),
        )
        
        current_comments = comment.comments if comment.comments is not None else 0
        updated_comments = current_comments + 1
        session.execute("UPDATE twitter.comments SET comments = %s WHERE id = %s", (updated_comments,comment_id))


        return Response(
            {"status": "success", "comment_id": str(comment_id)},
            status=status.HTTP_201_CREATED,
        )


class GetCommentsView(APIView):
    def get(self, request, tweet_id):
        user_id = str(request.user.id)
        
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.comments WHERE tweet_id = %s ALLOW FILTERING",
            (tweet_id,),
        )
        # rows = list(rows)
        comments = []
        for row in rows:
            comment_id = row.id
            isLiked = session.execute(
                "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (comment_id, user_id),
            )
            isRetweeted = session.execute(
                "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (comment_id, user_id),
            )
            like = session.execute(
                "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (comment_id, user_id),
            ).one()
            like_id = str(like.id) if like else None
            retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (comment_id, user_id),
            ).one()
            delete_retweet_id = str(retweet.id) if retweet else None
            
            try:
                user = User.objects.get(id=row.user_id)
            except User.DoesNotExist:
                return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserSerializer(user)
            username = serializer.data['username']
            
            comment_details = {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "content": row.content,
                "created_at": row.created_at,
                "retweet_id": row.retweet_id,
                "image_urls": row.image_urls,
                "likes": row.likes,
                "comments": row.comments,
                "retweets": row.retweets,
                "username": username,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id
            }
            comments.append(comment_details)
     
        return Response({"comments": comments}, status=status.HTTP_200_OK)


# class GetSingleCommentView(APIView):
#     def get(self, request, comment_id):
#         user_id = str(request.user.id)
#         session = get_session()
#         comment = session.execute(
#             "SELECT * FROM twitter.comments WHERE id = %s ALLOW FILTERING",
#             (comment_id,),
#         )
        
#         comment = list(comment)
#         if not comment:
#             return Response(
#                 {"status": "fail", "message": "Comment does not exist"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
#         comment = comment[0]
#         isLiked = session.execute(
#             "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
#             (comment_id, user_id),
#         )
        
#         isRetweeted = session.execute(
#             "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
#             (comment_id, user_id),
#         )
#         like_id = session.execute(
#             "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
#             (comment_id, user_id),
#         ).id
#         retweeted_id = session.execute(
#             "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
#             (comment_id, user_id),
#         ).id

      
#         return Response(
#             {
#                 "id": str(comment.id),
#                 "tweet_id": comment.tweet_id,
#                 "user_id": comment.user_id,
#                 "content": comment.content,
#                 "created_at": comment.created_at,
#                 "retweet_id": comment.retweet_id,
#                 "image_urls": comment.image_urls,
#                 "likes": comment.likes,
#                 "comments": comment.comments,
#                 "retweets": comment.retweets,
#                 "isLiked": bool(isLiked),
#                 "isRetweeted": bool(isRetweeted),
#                 "like_id": like_id,
#                 "retweeted_id": retweeted_id,
               
#             },
#             status=status.HTTP_200_OK,
#         )
  
    
class GetSingleCommentView(APIView):

    def get(self, request, comment_id):
        user_id = str(request.user.id)
        session = get_session()

        tweet = session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s ALLOW FILTERING", (comment_id,)
        ).one()
        
        if not tweet:
            return Response({'status': 'fail', 'message': 'Tweet does not exist' }, status=status.HTTP_400_BAD_REQUEST)
        
        isLiked = session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (comment_id, user_id),
        ).one()
        
        isRetweeted = session.execute(
            "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
            (comment_id, user_id),
        ).one()
        
        like = session.execute(
            "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (comment_id, user_id),
        ).one()
        like_id = str(like.id) if like else None
        
        retweet = session.execute(
            "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
            (comment_id, user_id),
        ).one()
        delete_retweet_id = str(retweet.id) if retweet else None
        
        try:
            user = User.objects.get(id=tweet.user_id)
        except User.DoesNotExist:
            return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(user)
        username = serializer.data['username']
        
        result = session.execute(
            "SELECT retweet_id FROM twitter.comments WHERE id = %s ALLOW FILTERING", (comment_id,)
        ).one()
        
        if result is not None and result.retweet_id is not None:
            original_tweet_id = result.retweet_id
            original_tweet = session.execute(
                "SELECT * FROM twitter.comments WHERE id = %s ALLOW FILTERING", (original_tweet_id,)
            ).one()
            try:
                user = User.objects.get(id=original_tweet.user_id)
            except User.DoesNotExist:
                return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserSerializer(user)
            original_tweet_username = serializer.data['username']
            
            original_tweet_isLiked = session.execute(
                "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            )
            original_tweet_isRetweeted = session.execute(
                "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            )
            original_tweet_like = session.execute(
                "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            ).one()
            original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None
            original_tweet_retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            ).one()
            original_tweet_delete_retweet_id = str(original_tweet_retweet.id) if retweet else None
               

            return Response(
                {
                    "id": str(tweet.id),
                    "user_id": tweet.user_id,
                    "content": tweet.content,
                    "created_at": tweet.created_at,
                    "retweet_id": tweet.retweet_id,
                    "image_urls": tweet.image_urls,
                    "likes": tweet.likes,
                    "comments": tweet.comments,
                    "retweets": tweet.retweets,
                    "username": username,
                    "isLiked": bool(isLiked),
                    "isRetweeted": bool(isRetweeted),
                    "like_id": like_id,
                    "delete_retweet_id": delete_retweet_id,
                    "original_tweet": {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "delete_retweet_id": original_tweet_delete_retweet_id,
                        "username": original_tweet_username,
                    }
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "id": str(tweet.id),
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
            },
            status=status.HTTP_200_OK,
        )    


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
        comment_res =  session.execute("SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)).one()
        if not comment_res:
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

        tweet_id = session.execute(
            "SELECT tweet_id FROM twitter.comments WHERE id = %s", (comment_id,)
        )[0].tweet_id
        tweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s", (tweet_id,)
        ).one()
        if not tweet:
            session.execute("DELETE FROM twitter.comments WHERE id = %s", (comment_id,))
        else:
        # if retweets exist for the commwnt, delete them
        # retweets_to_del = session.execute(
        #     "SELECT id FROM twitter.retweets WHERE tweet_id = %s ALLOW FILTERING",
        #     (comment_id,),
        # )
        # for retweet in retweets_to_del:
        #     session.execute("DELETE FROM twitter.retweets WHERE id = %s", (retweet.id,))
            current_comments =tweet.comments if tweet.comments is not None else 0
            updated_comments = current_comments - 1
            session.execute(
                "UPDATE twitter.tweets SET comments = %s WHERE id = %s", (updated_comments,tweet_id,)
            )
            session.execute("DELETE FROM twitter.comments WHERE id = %s", (comment_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class LikeCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, comment_id):
        user_id = str(request.user.id)
        session = get_session()

        # if comment doesn't exist
        comment = session.execute("SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)).one()
        
        if not comment:
            return Response(
                {"status": "fail", "message": "Comment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        like_id = uuid4()
        like = session.execute(
            "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
            (comment_id, user_id),
        ).one()
        
        if like:
            return Response(
                {"status": "fail", "message": "You have already liked this tweet"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        session.execute(
            """
        INSERT INTO twitter.likes (id, tweet_id, user_id, created_at)
        VALUES (%s, %s, %s, toTimestamp(now()))
        """,
            (like_id, comment_id, user_id),
        )

        current_likes = comment.likes if comment.likes is not None else 0
        updated_likes = current_likes + 1
        session.execute("UPDATE twitter.comments SET likes = %s WHERE id = %s", (updated_likes,comment_id))   

        return Response(
            {"status": "success", "like_id": str(like_id)},
            status=status.HTTP_201_CREATED,
        )


class UnlikeCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, like_id):
        user_id = str(request.user.id)
        # comment_id = request.data.get("comment_id")
        session = get_session()

        # if like doesn't exist
        if not session.execute("SELECT * FROM twitter.likes WHERE id = %s", (like_id,)):
            return Response(
                {"status": "fail", "message": "Like does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # TODO: check here too
        comment_id = session.execute("SELECT tweet_id FROM twitter.likes WHERE id = %s", (like_id,))[0].tweet_id
        comment = session.execute("SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)).one()
        
        curernt_likes = comment.likes if not None else 0
        updated_likes = curernt_likes - 1
        session.execute("UPDATE twitter.comments SET likes = %s WHERE id = %s", (updated_likes,comment_id))   

        session.execute("DELETE FROM twitter.likes WHERE id = %s ", (like_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class RetweetCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, comment_id):
        user_id = str(request.user.id)
        retweet_id = uuid4()
        
        # retweet_id = uuid4()
        # tweet_id = uuid4()
        content = request.data.get("content", "")
        session = get_session()

        tweet_result = session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        ).one()
        # if comment doesn't exist
        if not tweet_result:
            return Response(
                {"status": "fail", "message": "Comment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if tweet_result is not None and not tweet_result.content:
            return Response({"status": "fail", "message": "Cannot retweet empty retweet"},status=status.HTTP_400_BAD_REQUEST)  
        
        # if user already retweeted
        existing_retweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
            (comment_id, user_id),
        ).one()
        if existing_retweet:
            return Response(
                {"status": "fail", "message": "You have already retweeted this tweet"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # TODO: check here too
        
        likes = tweet_result.likes
        comments = tweet_result.comments
        retweets = tweet_result.retweets
      
        current_retweets = retweets if retweets is not None else 0
        updated_retweets = current_retweets + 1
        session.execute(
            "UPDATE twitter.comments SET retweets = %s WHERE id = %s", (updated_retweets,comment_id)
        )

        session.execute(
            """
        INSERT INTO twitter.tweets (id,user_id, created_at, content, retweet_id, likes, comments, retweets)
        VALUES (%s, %s, toTimestamp(now()), %s, %s, %s, %s, %s)
        """,
            (retweet_id, user_id, content, comment_id, likes, comments, retweets ),
        )

        return Response(
            {"status": "success", "tweet_id": str(retweet_id)},
            status=status.HTTP_201_CREATED,
        )


class GetCommentsForComment(APIView):
    def get(self, request, comment_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.comments WHERE tweet_id = %s ALLOW FILTERING",
            (comment_id,),
        )
        comments = [
            {
                "id": str(row.id),
                "tweet_id": row.tweet_id,
                "user_id": row.user_id,
                "content": row.content,
                "created_at": row.created_at,
                "retweet_id": row.retweet_id,
                "image_urls": row.image_urls,
                "likes": row.likes,
                "comments": row.comments,
                "retweets": row.retweets
            }
            for row in rows
        ]
        return Response({"comments": comments}, status=status.HTTP_200_OK)

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


class RetweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, tweet_id):
        user_id = str(request.user.id)
        retweet_id = uuid4()
        content = request.data.get('content', '') 
        images = request.FILES.getlist("images")
        session = get_session()

        if len(images) > 4:
            return Response(
                {"status": "fail", "message": "You can upload a maximum of 4 images"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        tweet_result = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s", (tweet_id,)
        ).one()
        if not tweet_result:
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if tweet_result is not None and not tweet_result.content:
            return Response({"status": "fail", "message": "Cannot retweet empty retweet"},status=status.HTTP_400_BAD_REQUEST)  
        
        existing_retweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
            (tweet_id, user_id),
        ).one()
        if existing_retweet:
            return Response(
                {"status": "fail", "message": "You have already retweeted this tweet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        likes = tweet_result.likes
        comments = tweet_result.comments
        retweets = tweet_result.retweets
        image_urls = []
        if images:            
            for image in images:
                image_url = self.upload_image_to_seaweedfs(image, retweet_id)
                image_urls.append(image_url)
          
        current_retweets = retweets if retweets is not None else 0
        updated_retweets = current_retweets + 1
        session.execute(
            "UPDATE twitter.tweets SET retweets = %s WHERE id = %s", (updated_retweets, tweet_id)
        )

        session.execute(
            """
            INSERT INTO twitter.tweets (id, user_id, created_at, content, retweet_id, image_urls, likes, comments, retweets)
            VALUES (%s, %s, toTimestamp(now()), %s, %s, %s, %s, %s, %s)
            """,
            (retweet_id, user_id, content, tweet_id, image_urls, likes, comments, retweets),
        )

        return Response(
            {"status": "success", "retweet_id": str(retweet_id)},
            status=status.HTTP_201_CREATED,
        )
        
    def upload_image_to_seaweedfs(self, image: InMemoryUploadedFile, retweet_id):
        url = f"http://seaweedfsfiler:8888/tweets/{retweet_id}/{image.name}"
        path = f"/tweets/{retweet_id}/{image.name}"
        file = {"file": image.file}
        response = requests.post(url, files=file)
        if response.status_code == 201:
            return path

        else:
            return Exception("Failed to upload image to SeaweedFS")
    


class DeleteRetweetView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, retweet_id):
        session = get_session()

        result = session.execute(
            "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (retweet_id,)
        ).one()
        
        if result is None or result.retweet_id is None:
            return Response({"status": "Tweet is not a retweet"}, status=status.HTTP_400_BAD_REQUEST)

        retweet_id_value = result.retweet_id
        
        retweet_res = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (retweet_id,)
        ).one()
        
        if not retweet_res:
            return Response(
                {"status": "fail", "message": "Retweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        tweet_id = retweet_res.retweet_id
        
        tweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
        ).one()
        
        if not tweet:
            session.execute("DELETE FROM twitter.tweets WHERE id = %s", (retweet_id,))
            return Response({"status": "success"}, status=status.HTTP_200_OK)

        current_retweets = tweet.retweets if tweet.retweets is not None else 0
        updated_retweets = current_retweets - 1
        session.execute(
            "UPDATE twitter.tweets SET retweets = %s WHERE id = %s", (updated_retweets, tweet_id,)
        )
        
        session.execute("DELETE FROM twitter.tweets WHERE id = %s", (retweet_id,))
        
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class GetRetweetsView(APIView):
    def get(self, request, tweet_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.tweets WHERE retweet_id = %s ALLOW FILTERING",
            (tweet_id,),
        )
        retweets = [
            {
                "id": str(row.id),
                "user_id": row.user_id,
                "created_at": row.created_at,
                "content": row.content,
                "retweet_id": row.retweet_id,
                "likes": row.likes,
                "comments": row.comments,
                "retweets": row.retweets
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
        # tweets = [
        #     {
        #         "id": str(row.id),
        #         "user_id": row.user_id,
        #         "content": row.content,
        #         "created_at": row.created_at,
        #         "likes": row.likes,
        #         "comments": row.comments,
        #         "retweets": row.retweets
        #     }
        #     for row in rows
        # ]
        timeline = []
        for tweet in rows:
            tweet_id = tweet.id
            isLiked = session.execute(
                "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            )
            isRetweeted = session.execute(
                "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            )
            like = session.execute(
                "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            like_id = str(like.id) if like else None
            retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            delete_retweet_id = str(retweet.id) if retweet else None
            
            result = session.execute(
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
            ).one()
            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserSerializer(user)
            username = serializer.data['username']
            profile_image = serializer.data['profile_image']
            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image":profile_image,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
            }
            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (original_tweet_id,)
                ).one()
                try:
                    user = User.objects.get(id=original_tweet.user_id)
                except User.DoesNotExist:
                    return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

                original_tweet_serializer = UserSerializer(user)
                original_tweet_username = original_tweet_serializer.data['username']
                original_tweet_profile_image = original_tweet_serializer.data['profile_image']
                original_tweet_isLiked = session.execute(
                    "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                )
                original_tweet_isRetweeted = session.execute(
                    "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                )
                original_tweet_like = session.execute(
                    "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                ).one()
                original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None
                if original_tweet:
                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "username": original_tweet_username,
                        "profile_image":original_tweet_profile_image,
                        
                    }
            timeline.append(tweet_details)
        return Response({"tweets": timeline}, status=status.HTTP_200_OK)


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
                "likes": row.likes,
                "comments": row.comments,
                "retweets": row.retweets
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
        tweets = []
        for row in rows:
            tweet_id = row.tweet_id
            tweet =  session.execute(
                "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
            ).one()
            if tweet:
                tweets.append(tweet)

        timeline = []
        for tweet in tweets:
            tweet_id = tweet.id
            isLiked = session.execute(
                "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            isRetweeted = session.execute(
                "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            like = session.execute(
                "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            like_id = str(like.id) if like else None
            retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            delete_retweet_id = str(retweet.id) if retweet else None
            result = session.execute(
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
            ).one()
            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = UserSerializer(user)
            username = serializer.data['username']
            profile_image = serializer.data['profile_image']
            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image":profile_image,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
            }
            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (original_tweet_id,)
                ).one()
                try:
                    user = User.objects.get(id=original_tweet.user_id)
                except User.DoesNotExist:
                    return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

                original_tweet_serializer = UserSerializer(user)
                original_tweet_username = original_tweet_serializer.data['username']
                original_tweet_profile_image = original_tweet_serializer.data['profile_image']
                original_tweet_isLiked = session.execute(
                    "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                )
                original_tweet_isRetweeted = session.execute(
                    "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                )
                original_tweet_like = session.execute(
                    "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                ).one()
                original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None
                if original_tweet:
                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "username": original_tweet_username,
                        "profile_image":original_tweet_profile_image,
                        
                    }
            timeline.append(tweet_details)

        return Response({"likes": timeline}, status=status.HTTP_200_OK)


class GetUserRetweetsView(APIView):
    def get(self, request, user_id):
        session = get_session()
        # TODO: edit for retweet as tweet. and retweet id is not empty
        rows = session.execute(
            "SELECT * FROM twitter.tweets WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        retweets = [
            {
                "id": str(row.id),
                "user_id": row.user_id,
                "created_at": row.created_at,
                "content": row.content,
                "retweet_id": row.retweet_id,
                "likes": row.likes,
                "comments": row.comments,
                "retweets": row.retweets
                
            }
            for row in rows if row.retweet_id is not None
        ]
        return Response({"retweets": retweets}, status=status.HTTP_200_OK)



# class FriendsTimelineView(APIView):
#     permission_classes = (IsAuthenticated,)

#     def get(self, request):
#         user = request.user
#         following_users = user.get_following()
#         following_ids = [str(follow.followed.id) for follow in following_users]
#         following_ids.append(str(user.id))
#         # print(f"Following IDs: {following_ids}")

#         if not following_ids:
#             return Response(
#                 {"message": "No following users found"},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         session = get_session()
#         followings_list = ", ".join(["%s"] * len(following_ids))
#         query = f"SELECT * FROM twitter.tweets WHERE user_id IN ({followings_list}) ALLOW FILTERING"

#         tweets = session.execute(query, following_ids)

#         timeline = []
#         for tweet in tweets:
#             tweet_id = tweet.id
#             user_id = str(request.user.id)
#             user_for_tweet = tweet.user_id
#             # username = str(request.user.username)
            
#             isLiked = session.execute(
#                 "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
#                 (tweet_id, user_id),
#             )
#             isRetweeted = session.execute(
#                 "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
#                 (tweet_id, user_id),
#             )
#             like = session.execute(
#                 "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
#                 (tweet_id, user_id),
#             ).one()
#             like_id = str(like.id) if like else None
#             retweet = session.execute(
#                 "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
#                 (tweet_id, user_id),
#             ).one()
#             delete_retweet_id = str(retweet.id) if retweet else None
            
            
            
#             result = session.execute(
#                 "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
#             ).one()
#             try:
#                 user = User.objects.get(id=tweet.user_id)
#             except User.DoesNotExist:
#                 return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

#             serializer = UserSerializer(user)
#             username = serializer.data['username']
#             tweet_details = {
#                 "id": tweet_id,
#                 "user_id": tweet.user_id,
#                 "content": tweet.content,
#                 "created_at": tweet.created_at,
#                 "retweet_id": tweet.retweet_id,
#                 "image_urls": tweet.image_urls,
#                 "likes": tweet.likes,
#                 "comments": tweet.comments,
#                 "retweets": tweet.retweets,
#                 "username": username,
#                 "isLiked": bool(isLiked),
#                 "isRetweeted": bool(isRetweeted),
#                 "like_id": like_id,
#                 "delete_retweet_id": delete_retweet_id
#             }
            
#             if result and result.retweet_id:
#                 original_tweet_id = result.retweet_id
#                 original_tweet = session.execute(
#                     "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (original_tweet_id,)
#                 ).one()
                
#                 try:
#                     user = User.objects.get(id=original_tweet.user_id)
#                 except User.DoesNotExist:
#                     return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

#                 serializer = UserSerializer(user)
#                 original_tweet_username = serializer.data['username']
                
#                 original_tweet_isLiked = session.execute(
#                     "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
#                     (original_tweet_id, user_id),
#                 )
#                 original_tweet_isRetweeted = session.execute(
#                     "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
#                     (original_tweet_id, user_id),
#                 )
#                 original_tweet_like = session.execute(
#                     "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
#                     (original_tweet_id, user_id),
#                 ).one()
#                 original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None
#                 original_tweet_retweet = session.execute(
#                     "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
#                     (original_tweet_id, user_id),
#                 ).one()
#                 original_tweet_delete_retweet_id = str(original_tweet_retweet.id) if retweet else None
#                 if original_tweet:
#                     tweet_details["original_tweet"] = {
#                         "id": str(original_tweet_id),
#                         "user_id": original_tweet.user_id,
#                         "content": original_tweet.content,
#                         "created_at": original_tweet.created_at,
#                         "retweet_id": original_tweet.retweet_id,
#                         "image_urls": original_tweet.image_urls,
#                         "likes": original_tweet.likes,
#                         "comments": original_tweet.comments,
#                         "retweets": original_tweet.retweets,
#                         "isLiked": bool(original_tweet_isLiked),
#                         "isRetweeted": bool(original_tweet_isRetweeted),
#                         "like_id": original_tweet_like_id,
#                         "delete_retweet_id": original_tweet_delete_retweet_id,
#                         "username": original_tweet_username,
                        
#                     }
#             timeline.append(tweet_details)
#         # print(f"Retrieved tweets: {timeline}")

#         return Response({"tweets": timeline}, status=status.HTTP_200_OK)

class FriendsTimelineView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        following_users = user.get_following()
        following_ids = [str(follow.followed.id) for follow in following_users]
        following_ids.append(str(user.id))

        if not following_ids:
            return Response(
                {"message": "No following users found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        session = get_session()
        followings_list = ", ".join(["%s"] * len(following_ids))
        query = f"SELECT * FROM twitter.tweets WHERE user_id IN ({followings_list}) ALLOW FILTERING"

        tweets = session.execute(query, following_ids)
        
        tweets_list = list(tweets)
        page_number = request.GET.get('page')

        paginator = Paginator(tweets_list,10)
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            pagr_obj = paginator.page(1)
        except EmptyPage:
            pagr_obj = paginator.page(paginator.num_pages)
        
        timeline = []
        for tweet in page_obj.object_list:
            tweet_id = tweet.id
            user_id = str(request.user.id)
            
            like = session.execute(
                "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            like_id = str(like.id) if like else None
            
            retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            delete_retweet_id = str(retweet.id) if retweet else None

            result = session.execute(
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
            ).one()

            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserSerializer(user)
            username = serializer.data['username']
            profile_image = serializer.data['profile_image']

            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image": profile_image,
                "isLiked": bool(like),
                "isRetweeted": bool(retweet),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id
            }
            
            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (original_tweet_id,)
                ).one()

                try:
                    original_user = User.objects.get(id=original_tweet.user_id)
                except User.DoesNotExist:
                    return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

                original_serializer = UserSerializer(original_user)
                original_tweet_username = original_serializer.data['username']
                original_tweet_profile_image = original_serializer.data['profile_image']
                original_tweet_like = session.execute(
                    "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                ).one()
                original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None

                original_tweet_retweet = session.execute(
                    "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                ).one()
                original_tweet_delete_retweet_id = str(original_tweet_retweet.id) if original_tweet_retweet else None

                if original_tweet:
                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_like),
                        "isRetweeted": bool(original_tweet_retweet),
                        "like_id": original_tweet_like_id,
                        "delete_retweet_id": original_tweet_delete_retweet_id,
                        "username": original_tweet_username,
                        "profile_image":original_tweet_profile_image
                    }
            
            timeline.append(tweet_details)

        return Response({"tweets": timeline, "page":page_number, "total_pages": paginator.num_pages, "total_tweets": paginator.count}, status=status.HTTP_200_OK)

class UserTimelineView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        session = get_session()
        # logger.info("aaaaaa")
        user_id = str(request.user.id)
        # logger.info("bbb")
        tweets = session.execute(
            "SELECT * FROM twitter.tweets WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        # logger.info("ccc")
        timeline = []
        for tweet in tweets:
            tweet_id = tweet.id
            isLiked = session.execute(
                "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            )
            isRetweeted = session.execute(
                "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            )
            like = session.execute(
                "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            like_id = str(like.id) if like else None
            retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            delete_retweet_id = str(retweet.id) if retweet else None
            
            result = session.execute(
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
            ).one()
            
            
            
            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserSerializer(user)
            username = serializer.data['username']
            profile_image = serializer.data['profile_image']
            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image":profile_image,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
            }
            
            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (original_tweet_id,)
                ).one()
                try:
                    user = User.objects.get(id=original_tweet.user_id)
                except User.DoesNotExist:
                    return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

                original_tweet_serializer = UserSerializer(user)
                original_tweet_username = original_tweet_serializer.data['username']
                original_tweet_profile_image = original_tweet_serializer.data['profile_image']
                original_tweet_isLiked = session.execute(
                    "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                )
                original_tweet_isRetweeted = session.execute(
                    "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                )
                original_tweet_like = session.execute(
                    "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                ).one()
                original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None
                if original_tweet:
                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "username": original_tweet_username,
                        "profile_image":original_tweet_profile_image,
                        
                    }
            timeline.append(tweet_details)
        return Response({"tweets": timeline}, status=status.HTTP_200_OK)
                
      

class GetCurrentUserRetweets(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        session = get_session()
        user_id = str(request.user.id)
        # TODO: do for retweet
        rows = session.execute(
            "SELECT * FROM twitter.tweets WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )
        retweets = [
            {
                "id": str(row.id),
                "user_id": row.user_id,
                "created_at": row.created_at,
                "content": row.content,
                "retweet_id": row.retweet_id,
                "likes": row.likes,
                "comments": row.comments,
                "retweets": row.retweets
            }
            for row in rows if row.retweet_id is not None
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
        # likes = [
        #     {
        #         "id": str(row.id),
        #         "tweet_id": row.tweet_id,
        #         "user_id": row.user_id,
        #         "created_at": row.created_at,
        #     }
        #     for row in rows
        # ]
        
        tweets = []
        for row in rows:
            tweet_id = row.tweet_id
            tweet =  session.execute(
                "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
            )
            tweets.append(tweet)
        
        timeline = []
        for tweet in tweets:
            tweet_id = tweet.id
            isLiked = session.execute(
                "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            )
            isRetweeted = session.execute(
                "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            )
            like = session.execute(
                "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            like_id = str(like.id) if like else None
            retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (tweet_id, user_id),
            ).one()
            delete_retweet_id = str(retweet.id) if retweet else None
            result = session.execute(
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
            ).one()
            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = UserSerializer(user)
            username = serializer.data['username']
            profile_image = serializer.data['profile_image']
            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image":profile_image,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
            }
            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (original_tweet_id,)
                ).one()
                try:
                    user = User.objects.get(id=original_tweet.user_id)
                except User.DoesNotExist:
                    return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

                original_tweet_serializer = UserSerializer(user)
                original_tweet_username = original_tweet_serializer.data['username']
                original_tweet_profile_image = original_tweet_serializer.data['profile_image']
                original_tweet_isLiked = session.execute(
                    "SELECT * FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                )
                original_tweet_isRetweeted = session.execute(
                    "SELECT * FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                )
                original_tweet_like = session.execute(
                    "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                    (original_tweet_id, user_id),
                ).one()
                original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None
                if original_tweet:
                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "username": original_tweet_username,
                        "profile_image":original_tweet_profile_image,
                        
                    }
            timeline.append(tweet_details)
                
        return Response({"likes": timeline}, status=status.HTTP_200_OK)


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
                "retweet_id": row.retweet_id,
                "likes": row.likes,
                "comments": row.comments,
                "retweets": row.retweets
            }
            for row in rows
        ]
        return Response({"comments": comments}, status=status.HTTP_200_OK)


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

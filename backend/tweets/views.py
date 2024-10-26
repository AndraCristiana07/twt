import asyncio
import json
import logging
import os
import subprocess
import time
import math

from uuid import UUID, uuid4
import ffmpeg
import requests
from app.models import User
from app.serializer import UserSerializer
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.shortcuts import render
from rest_framework import status
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from elasticsearch_dsl.query import MultiMatch
# from tweets.documents import TweetDocument
from tweets.cassandra_def import get_session

logger = logging.getLogger(__name__)

# Create your views here. now


def is_valid_uuid(uuid_to_test, version=4):
    try:
        uuid_obj = UUID(uuid_to_test, version=version)
    except ValueError:
        return False
    return str(uuid_obj) == uuid_to_test

class PostTweetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        user_id = str(request.user.id)
        content = request.data.get("content")
        media = request.FILES.getlist("images")
        tweet_id = uuid4()

        session = get_session()
        if len(media) > 4:
            return Response(
                {"status": "fail", "message": "You can upload a maximum of 4 images"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not content and not media:
            return Response(
                {"status": "fail", "message": "Content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        media_urls = []
        video_durations = []

        for file in media:
            extension = os.path.splitext(file.name)[1][1:].strip().lower()

            if extension in ["png", "jpg", "jpeg"]:

                logger.debug("image")
                image_url = PostTweetView.upload_image_to_seaweedfs(file, tweet_id)
                media_urls.append(image_url)

            elif extension in ["mp4", "webm"]:

                logger.debug("video")
                logger.debug("ext" + extension)

                video_url, duration = PostTweetView.upload_video_to_seaweedfs(file, tweet_id)

                media_urls.append(video_url)
                video_durations.append(duration)
                # video_info = self.get_video_info(tweet_id)

        session.execute(
            """
                INSERT INTO twitter.tweets (id, user_id, created_at, content, retweet_id, image_urls, video_duration, likes, comments, retweets)
                VALUES (%s, %s, toTimestamp(now()), %s, %s, %s, %s, 0, 0, 0)
                """,
            (tweet_id, user_id, content, None, media_urls, video_durations),
        )

        return Response(
            {"status": "success", "tweet_id": tweet_id}, status=status.HTTP_201_CREATED
        )

    def get_duration(video_path: str) -> str:

        # command = f'ffmpeg -f mp4 -i pipe: {video_path}'
        command = f"ffmpeg -i  {video_path}"

        (stdout, stderr) = subprocess.Popen(
            command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        ).communicate()
        duration_str = (
            list(
                filter(
                    lambda s: "Duration:" in s,
                    stderr.decode("utf-8").rstrip().splitlines(),
                )
            )[0]
            .split(" ")[3]
            .split(",")[0]
        )

        logger.debug("vid length" + str(duration_str))

        if duration_str:
            return duration_str
        else:
            logger.error(f"STDOUT {stdout}")
            logger.error(f"STDERR {stderr}")
            raise Exception("Bad video")


    def conversion(video: InMemoryUploadedFile):

        pipe_fifo = f"/tmp/{video.name}.fifo"
        file_name, file_extension = os.path.splitext(pipe_fifo)
        output_path = f"{file_name}-converted{file_extension}"

        if os.path.exists(pipe_fifo):
            os.unlink(pipe_fifo)

        logging.debug(pipe_fifo)
        os.mkfifo(pipe_fifo)

        # time.sleep(10)
        # await asyncio.sleep(5)

        logging.debug("creating process")
        p = subprocess.Popen(
            f"ffmpeg -f mp4 -i {pipe_fifo} -c copy -f mp4 -movflags frag_keyframe+empty_moov+default_base_moof -acodec aac -vcodec copy {output_path}",
            # f"ffmpeg -f mp4 -i {pipe_fifo} -c copy -f mp4 -movflags frag_keyframe+empty_moov+default_base_moof -acodec aac  segment -segment_time 10 -vcodec copy -reset_timestamps 1 -map 0 {output_path}",
            
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        logging.debug("process created")

        logging.debug(f"opening pipe")
        fd = os.open(pipe_fifo, flags=os.O_WRONLY)
        logging.debug(f"pipe at {fd}")

        logging.debug("writing to pipe")
        os.write(fd, video.file.read())
        os.close(fd)

        (stdout, stderr) = p.communicate()

        os.unlink(pipe_fifo)

        logging.debug(stdout)
        logging.debug(stderr)

        return output_path

    def upload_image_to_seaweedfs( image: InMemoryUploadedFile, tweet_id):

        url = f"http://seaweedfsfiler:8888/tweets/{tweet_id}/image/{image.name}"
        path = f"/tweets/{tweet_id}/image/{image.name}"
        file = {"file": image.file}

        logger.error(image.name)

        response = requests.post(url, files=file)

        if response.status_code == 201:
            return path

        else:
            return Exception("Failed to upload image to SeaweedFS")

    def segmentation(path: str, video_name: str, duration: str, output_dir: str):
        segment_time = 10
        time = duration.split(":")
        
        
        video_duration = int(time[0]) * 3600 +int(time[1]) * 60 + int(time[2].split('.')[0]) + int(time[2].split('.')[1]) * 0.001
        
        num_chunks = math.ceil(video_duration / segment_time)
        logger.debug(f'number of chunks: {num_chunks}')
        
        
        os.makedirs(output_dir, exist_ok=True)

        
        output_template = os.path.join(output_dir, f"{video_name}_%d.mp4")
        command = f'ffmpeg -i {path} -hls_segment_type fmp4 -hls_list_size 0 -hls_time 2 -acodec aac -vcodec h264 -hls_segment_filename {output_template} {output_dir}/out.m3u8'
        # command = f'ffmpeg -i {path} -acodec copy -f segment -segment_time {segment_time} -vcodec copy -reset_timestamps 1 -map 0 {output_template}'
    
        p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        (stdout, stderr) = p.communicate()
        lst = os.listdir(output_dir)
        chunks_number = len(lst)
        logger.debug(f'number of files {chunks_number}')
        
        segments = []
        init_file = os.path.join(output_dir, 'init.mp4')
        out_file = os.path.join(output_dir, 'out.m3u8')
        for i in range(chunks_number - 2):
            segment = os.path.join(output_dir, f'{video_name}_{i}.mp4')
            
            segments.append(segment)
        return segments, init_file, out_file

            

    def upload_video_to_seaweedfs( video: InMemoryUploadedFile, tweet_id):
        try:
            
            video_name = os.path.splitext(video.name)[0].strip()
            logger.debug(f'video name: {video_name}')

            new_file_path = PostTweetView.conversion(video)
            duration = PostTweetView.get_duration(new_file_path)

            
            output_dir = f"/tmp/{tweet_id}/{video.name}"
            segments,init_file, out_file = PostTweetView.segmentation(new_file_path, video_name, duration, output_dir)
            path = f"/tweets/{tweet_id}/video/{video.name}"
            init_url = f"http://seaweedfsfiler:8888/tweets/{tweet_id}/video/{video.name}/init.mp4"
            out_url = f"http://seaweedfsfiler:8888/tweets/{tweet_id}/video/{video.name}/out.m3u8"
            
            with open(init_file, "rb") as file:
                requests.post(init_url, files={"file":file})
            with open(out_file, "rb") as file:
                requests.post(out_url, files={"file":file})
                
            segment_urls = []

            
            for segment_path in segments:
                segment_name = os.path.basename(segment_path)  
                segment_url = f"http://seaweedfsfiler:8888/tweets/{tweet_id}/video/{video.name}/{segment_name}"
                
                
                with open(segment_path, "rb") as file:
                    response = requests.post(segment_url, files={"file": file})

                if response.status_code == 201:
                
                    segment_urls.append(segment_url)
                else:
                    raise Exception(f"Failed to upload segment {segment_name} to SeaweedFS")

            return path, duration
        finally:
            pass 



class GetSingleTweetView(APIView):

    def get(self, request, tweet_id):
        user_id = str(request.user.id)
        session = get_session()

        tweet = session.execute(
            "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING", (tweet_id,)
        ).one()

        if not tweet:
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
        media_url = tweet.image_urls
        video_info = FriendsTimelineView.get_videos_info(tweet_id, str(media_url))
        
        try:
            user = User.objects.get(id=tweet.user_id)
        except User.DoesNotExist:
            return Response(
                {"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(user)
        username = serializer.data["username"]

        result = session.execute(
            "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
            (tweet_id,),
        ).one()

        if result is not None and result.retweet_id is not None:
            original_tweet_id = result.retweet_id
            original_tweet = session.execute(
                "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (original_tweet_id,),
            ).one()
            try:
                user = User.objects.get(id=original_tweet.user_id)
            except User.DoesNotExist:
                return Response(
                    {"message": "User does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = UserSerializer(user)
            original_tweet_username = serializer.data["username"]

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
            original_tweet_like_id = (
                str(original_tweet_like.id) if original_tweet_like else None
            )
            original_tweet_retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            ).one()
            original_tweet_delete_retweet_id = (
                str(original_tweet_retweet.id) if retweet else None
            )
            original_tweet_media_url = original_tweet.image_urls
            original_tweet_video_info = FriendsTimelineView.get_videos_info(original_tweet_id, original_tweet_media_url)
        

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
                    "video_info": video_info if video_info else None,
                    "duration": tweet.video_duration,  

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
                        "video_info": original_tweet_video_info if original_tweet_video_info else None,
                        "duration": original_tweet.video_duration,  
                        
                        
                    },
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
                "video_info": video_info if video_info else None,
                "duration": tweet.video_duration,  
            },
            status=status.HTTP_200_OK,
        )

    


class GetSingleRetweetView(APIView):
    def get(self, request, retweet_id):
        user_id = str(request.user.id)
        session = get_session()
        result = session.execute(
            "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
            (retweet_id,),
        ).one()

        if result is None or result.retweet_id is None:
            return Response(
                {"status": "Tweet is not a retweet"}, status=status.HTTP_400_BAD_REQUEST
            )

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
            "SELECT id,retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
            (tweet_id,),
        ).one()

        # if result is None or result.retweet_id is not None:
        #     return Response({"status": "Tweet is a retweet"}, status=status.HTTP_400_BAD_REQUEST)
        if not result:
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if result.retweet_id is not None:
            return Response(
                {"status": "fail", "message": "Cannot delete a retweet directly"},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
            "UPDATE twitter.tweets SET likes = %s WHERE id = %s",
            (
                updated_likes,
                tweet_id,
            ),
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
                "UPDATE twitter.tweets SET likes = %s WHERE id = %s",
                (
                    updated_likes,
                    tweet_id,
                ),
            )

            session.execute("DELETE FROM twitter.likes WHERE id = %s ", (like_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class PostCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, tweet_id):
        user_id = str(request.user.id)
        content = request.data.get("content")
        
        media = request.FILES.getlist("images")
        comment_id = uuid4()

        if len(media) > 4:
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

        if not content and not media:
            return Response(
                {"status": "fail", "message": "Content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        media_urls = []
        video_durations = []
        for file in media:
            extension = os.path.splitext(file.name)[1][1:].strip().lower()

            if extension in ["png", "jpg", "jpeg"]:

                logger.debug("image")
                image_url = PostTweetView.upload_image_to_seaweedfs(file, comment_id)
                media_urls.append(image_url)

            elif extension in ["mp4", "webm"]:

                logger.debug("video")
                logger.debug("ext" + extension)

                video_url, duration = PostTweetView.upload_video_to_seaweedfs(file, comment_id)

                media_urls.append(video_url)
                video_durations.append(duration)
        # if media:
        #     for image in media:
        #         image_url = self.upload_image_to_seaweedfs(image, tweet_id)
        #         media_urls.append(image_url)

        session.execute(
            """
        INSERT INTO twitter.comments (id, tweet_id,user_id, content, created_at, retweet_id, image_urls, video_duration, likes, comments, retweets)
        VALUES (%s, %s, %s, %s, toTimestamp(now()), %s, %s, %s, 0, 0, 0)
        """,
            (comment_id, tweet_id, user_id, content, None, media_urls, video_durations),
        )

        current_comments = tweet.comments if tweet.comments is not None else 0
        updated_comments = current_comments + 1

        session.execute(
            "UPDATE twitter.tweets SET comments = %s WHERE id = %s",
            (updated_comments, tweet_id),
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
        media = request.FILES.getlist("images")
        
        comment_in_db_id = uuid4()
        likes = 0
        comments = 0
        retweets = 0
        session = get_session()

        if len(media) > 4:
            return Response(
                {"status": "fail", "message": "You can upload a maximum of 4 images"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        comment = session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        ).one()

        # if comment doesn't exist
        if not comment:
            return Response(
                {"status": "fail", "message": "Comment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not content and not media:
            return Response(
                {"status": "fail", "message": "Content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        media_urls = []
        video_durations = []
        for file in media:
            extension = os.path.splitext(file.name)[1][1:].strip().lower()

            if extension in ["png", "jpg", "jpeg"]:

                logger.debug("image")
                image_url = PostTweetView.upload_image_to_seaweedfs(file, comment_in_db_id)
                media_urls.append(image_url)

            elif extension in ["mp4", "webm"]:

                logger.debug("video")
                logger.debug("ext" + extension)

                video_url, duration = PostTweetView.upload_video_to_seaweedfs(file, comment_in_db_id)

                media_urls.append(video_url)
                video_durations.append(duration)
        # session.execute(
        #     """
        # INSERT INTO twitter.comments (id, tweet_id,user_id, content, created_at, retweet_id, likes, comments, retweets)
        # VALUES (%s, %s, %s, %s, toTimestamp(now()), %s, %s, %s, %s )
        # """,
        #     (
        #         comment_in_db_id,
        #         comment_id,
        #         user_id,
        #         content,
        #         None,
        #         likes,
        #         comments,
        #         retweets,
        #     ),
        # )
        session.execute(
            """
        INSERT INTO twitter.comments (id, tweet_id,user_id, content, created_at, retweet_id, image_urls, video_duration, likes, comments, retweets)
        VALUES (%s, %s, %s, %s, toTimestamp(now()), %s, %s, %s, 0, 0, 0)
        """,
            (comment_in_db_id, comment_id, user_id, content, None, media_urls, video_durations),
        )
        current_comments = comment.comments if comment.comments is not None else 0
        updated_comments = current_comments + 1
        session.execute(
            "UPDATE twitter.comments SET comments = %s WHERE id = %s",
            (updated_comments, comment_id),
        )

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

            result = session.execute(
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (comment_id,),
            ).one()
            try:
                user = User.objects.get(id=row.user_id)
            except User.DoesNotExist:
                return Response(
                    {"message": "User does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = UserSerializer(user)
            username = serializer.data["username"]
            profile_image = serializer.data["profile_image"]
            media_url = row.image_urls
            
            video_info = FriendsTimelineView.get_videos_info(comment_id, str(media_url))

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
                "profile_image": profile_image,
                
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
                "video_info": video_info if video_info else None,
                "duration": row.video_duration,  
                
                
            }
            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                    (original_tweet_id,),
                ).one()

                if original_tweet:
                    try:
                        original_user = User.objects.get(id=original_tweet.user_id)
                    except User.DoesNotExist:
                        return Response(
                            {"message": "User does not exist"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    original_serializer = UserSerializer(original_user)
                    original_tweet_username = original_serializer.data["username"]
                    original_tweet_profile_image = original_serializer.data["profile_image"]

                    original_tweet_like = session.execute(
                        "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                        (original_tweet_id, user_id),
                    ).one()
                    original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None

                    original_tweet_retweet = session.execute(
                        "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                        (original_tweet_id, user_id),
                    ).one()
                    original_tweet_delete_retweet_id = (
                        str(original_tweet_retweet.id) if original_tweet_retweet else None
                    )
                    
                    original_media_url = original_tweet.image_urls
                    original_video_info = FriendsTimelineView.get_videos_info(original_tweet_id, original_media_url)

                    # og tweet exists?!?!?!
                    comment_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content if original_tweet.content else "Original Tweet Deleted",
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "duration": original_tweet.video_duration,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_like),
                        "isRetweeted": bool(original_tweet_retweet),
                        "like_id": original_tweet_like_id,
                        "delete_retweet_id": original_tweet_delete_retweet_id,
                        "username": original_tweet_username,
                        "profile_image": original_tweet_profile_image,
                        "video_info": original_video_info
                    }
                else:
                    comment_details["original_tweet"] = {
                        "id": None,
                        "user_id": None,
                        "content": "Original tweet does not exist",
                        "created_at": None,
                        "retweet_id": None,
                        "image_urls": [],
                        "likes": 0,
                        "comments": 0,
                        "retweets": 0,
                        "isLiked": False,
                        "isRetweeted": False,
                        "like_id": None,
                        "delete_retweet_id": None,
                        "username": "Unknown User",
                        "profile_image": "default_profile_image_url",
                        "video_info": None,
                        "duration": None
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
            "SELECT * FROM twitter.comments WHERE id = %s ALLOW FILTERING",
            (comment_id,),
        ).one()

        if not tweet:
            return Response(
                {"status": "fail", "message": "Tweet does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
        media_url = tweet.image_urls
        video_info = FriendsTimelineView.get_videos_info(comment_id, str(media_url))
        
        try:
            user = User.objects.get(id=tweet.user_id)
        except User.DoesNotExist:
            return Response(
                {"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(user)
        username = serializer.data["username"]

        result = session.execute(
            "SELECT retweet_id FROM twitter.comments WHERE id = %s ALLOW FILTERING",
            (comment_id,),
        ).one()

        if result is not None and result.retweet_id is not None:
            original_tweet_id = result.retweet_id
            original_tweet = session.execute(
                "SELECT * FROM twitter.comments WHERE id = %s ALLOW FILTERING",
                (original_tweet_id,),
            ).one()
            try:
                user = User.objects.get(id=original_tweet.user_id)
            except User.DoesNotExist:
                return Response(
                    {"message": "User does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = UserSerializer(user)
            original_tweet_username = serializer.data["username"]

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
            original_tweet_like_id = (
                str(original_tweet_like.id) if original_tweet_like else None
            )
            original_tweet_retweet = session.execute(
                "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                (original_tweet_id, user_id),
            ).one()
            original_tweet_delete_retweet_id = (
                str(original_tweet_retweet.id) if retweet else None
            )
            original_tweet_media_url = original_tweet.image_urls
            original_tweet_video_info = FriendsTimelineView.get_videos_info(original_tweet_id, original_tweet_media_url)
        

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
                    "video_info": video_info if video_info else None,
                    "duration": tweet.video_duration,  
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
                        "video_info": original_tweet_video_info if original_tweet_video_info else None,
                        "duration": original_tweet.video_duration,  
                    },
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
                "video_info": video_info if video_info else None,
                "duration": tweet.video_duration,  
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
        comment_res = session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        ).one()
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
            current_comments = tweet.comments if tweet.comments is not None else 0
            updated_comments = current_comments - 1
            session.execute(
                "UPDATE twitter.tweets SET comments = %s WHERE id = %s",
                (
                    updated_comments,
                    tweet_id,
                ),
            )
            session.execute("DELETE FROM twitter.comments WHERE id = %s", (comment_id,))
        return Response({"status": "success"}, status=status.HTTP_200_OK)


class LikeCommentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, comment_id):
        user_id = str(request.user.id)
        session = get_session()

        # if comment doesn't exist
        comment = session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        ).one()

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
        session.execute(
            "UPDATE twitter.comments SET likes = %s WHERE id = %s",
            (updated_likes, comment_id),
        )

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
        comment_id = session.execute(
            "SELECT tweet_id FROM twitter.likes WHERE id = %s", (like_id,)
        )[0].tweet_id
        comment = session.execute(
            "SELECT * FROM twitter.comments WHERE id = %s", (comment_id,)
        ).one()

        curernt_likes = comment.likes if not None else 0
        updated_likes = curernt_likes - 1
        session.execute(
            "UPDATE twitter.comments SET likes = %s WHERE id = %s",
            (updated_likes, comment_id),
        )

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
            return Response(
                {"status": "fail", "message": "Cannot retweet empty retweet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
            "UPDATE twitter.comments SET retweets = %s WHERE id = %s",
            (updated_retweets, comment_id),
        )

        session.execute(
            """
        INSERT INTO twitter.tweets (id,user_id, created_at, content, retweet_id, likes, comments, retweets)
        VALUES (%s, %s, toTimestamp(now()), %s, %s, %s, %s, %s)
        """,
            (retweet_id, user_id, content, comment_id, likes, comments, retweets),
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
        # comments = [
        #     {
        #         "id": str(row.id),
        #         "tweet_id": row.tweet_id,
        #         "user_id": row.user_id,
        #         "content": row.content,
        #         "created_at": row.created_at,
        #         "retweet_id": row.retweet_id,
        #         "image_urls": row.image_urls,
        #         "likes": row.likes,
        #         "comments": row.comments,
        #         "retweets": row.retweets,
        #     }
        #     for row in rows
        # ]
        comments_list = list(rows)
        page_number = request.GET.get("page")

        paginator = Paginator(comments_list, 10)
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

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
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (tweet_id,),
            ).one()

            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response(
                    {"message": "User does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = UserSerializer(user)
            username = serializer.data["username"]
            profile_image = serializer.data["profile_image"]
            media_url = tweet.image_urls
            
            video_info = FriendsTimelineView.get_videos_info(tweet_id, str(media_url))

            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "duration": tweet.video_duration,
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image": profile_image,
                "isLiked": bool(like),
                "isRetweeted": bool(retweet),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
                "video_info": video_info if video_info else None,
            }

            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                    (original_tweet_id,),
                ).one()

                if original_tweet:
                    try:
                        original_user = User.objects.get(id=original_tweet.user_id)
                    except User.DoesNotExist:
                        return Response(
                            {"message": "User does not exist"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    original_serializer = UserSerializer(original_user)
                    original_tweet_username = original_serializer.data["username"]
                    original_tweet_profile_image = original_serializer.data["profile_image"]

                    original_tweet_like = session.execute(
                        "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                        (original_tweet_id, user_id),
                    ).one()
                    original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None

                    original_tweet_retweet = session.execute(
                        "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                        (original_tweet_id, user_id),
                    ).one()
                    original_tweet_delete_retweet_id = (
                        str(original_tweet_retweet.id) if original_tweet_retweet else None
                    )
                    
                    original_media_url = original_tweet.image_urls
                    original_video_info = FriendsTimelineView.get_videos_info(original_tweet_id, original_media_url)

                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content if original_tweet.content else "Original Tweet Deleted",
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "duration": original_tweet.video_duration,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_like),
                        "isRetweeted": bool(original_tweet_retweet),
                        "like_id": original_tweet_like_id,
                        "delete_retweet_id": original_tweet_delete_retweet_id,
                        "username": original_tweet_username,
                        "profile_image": original_tweet_profile_image,
                        "video_info": original_video_info
                    }
                else:
                    tweet_details["original_tweet"] = {
                        "id": None,
                        "user_id": None,
                        "content": "Original tweet does not exist",
                        "created_at": None,
                        "retweet_id": None,
                        "image_urls": [],
                        "likes": 0,
                        "comments": 0,
                        "retweets": 0,
                        "isLiked": False,
                        "isRetweeted": False,
                        "like_id": None,
                        "delete_retweet_id": None,
                        "username": "Unknown User",
                        "profile_image": "default_profile_image_url",
                        "video_info": None,
                        "duration": None
                    }

            timeline.append(tweet_details)

        return Response(
            {
                "comments": timeline,
                "page": page_number,
                "total_pages": paginator.num_pages,
                "total_tweets": paginator.count,
            },
            status=status.HTTP_200_OK,
        )
        
        # return Response({"comments": comments}, status=status.HTTP_200_OK)

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
        content = request.data.get("content", "")
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
            return Response(
                {"status": "fail", "message": "Cannot retweet empty retweet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
            "UPDATE twitter.tweets SET retweets = %s WHERE id = %s",
            (updated_retweets, tweet_id),
        )

        session.execute(
            """
            INSERT INTO twitter.tweets (id, user_id, created_at, content, retweet_id, image_urls, likes, comments, retweets)
            VALUES (%s, %s, toTimestamp(now()), %s, %s, %s, %s, %s, %s)
            """,
            (
                retweet_id,
                user_id,
                content,
                tweet_id,
                image_urls,
                likes,
                comments,
                retweets,
            ),
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
            "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
            (retweet_id,),
        ).one()

        if result is None or result.retweet_id is None:
            return Response(
                {"status": "Tweet is not a retweet"}, status=status.HTTP_400_BAD_REQUEST
            )

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
            "UPDATE twitter.tweets SET retweets = %s WHERE id = %s",
            (
                updated_retweets,
                tweet_id,
            ),
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
                "retweets": row.retweets,
            }
            for row in rows
        ]
        return Response({"retweets": retweets}, status=status.HTTP_200_OK)


class GetUserTweetsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, user_id):
        session = get_session()
        rows = session.execute(
            "SELECT * FROM twitter.tweets WHERE user_id = %s ALLOW FILTERING",
            (user_id,),
        )

        tweets_list = list(rows)
        page_number = request.GET.get("page")

        paginator = Paginator(tweets_list, 10)
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        timeline = []
        for tweet in page_obj.object_list:
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
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (tweet_id,),
            ).one()
            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response(
                    {"message": "User does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = UserSerializer(user)
            username = serializer.data["username"]
            media_url = tweet.image_urls
            video_info = FriendsTimelineView.get_videos_info(tweet_id, str(media_url))
            
            profile_image = serializer.data["profile_image"]
            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "duration": tweet.video_duration,  
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image": profile_image,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
                "video_info": video_info if video_info else None,
            }
            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                    (original_tweet_id,),
                ).one()
                try:
                    user = User.objects.get(id=original_tweet.user_id)
                except User.DoesNotExist:
                    return Response(
                        {"message": "User does not exist"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                original_tweet_serializer = UserSerializer(user)
                original_tweet_username = original_tweet_serializer.data["username"]
                original_tweet_profile_image = original_tweet_serializer.data[
                    "profile_image"
                ]
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
                original_tweet_like_id = (
                    str(original_tweet_like.id) if original_tweet_like else None
                )
                media_url = original_tweet.image_urls
                video_info = FriendsTimelineView.get_videos_info(original_tweet_id, media_url)
        
                if original_tweet:
                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "duration": original_tweet.video_duration,  
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "username": original_tweet_username,
                        "profile_image": original_tweet_profile_image,
                        "video_info": video_info
                        
                    }
            timeline.append(tweet_details)
        return Response(
            {
                "tweets": timeline,
                "page": page_number,
                "total_pages": paginator.num_pages,
                "total_tweets": paginator.count,
            },
            status=status.HTTP_200_OK,
        )


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
                "retweets": row.retweets,
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
            tweet = session.execute(
                "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (tweet_id,),
            ).one()
            if tweet:
                tweets.append(tweet)

        tweets_list = list(tweets)
        page_number = request.GET.get("page")

        paginator = Paginator(tweets_list, 10)
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        timeline = []
        for tweet in page_obj.object_list:
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
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (tweet_id,),
            ).one()
            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response(
                    {"message": "User does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = UserSerializer(user)
            username = serializer.data["username"]
            profile_image = serializer.data["profile_image"]
            media_url = tweet.image_urls
            video_info = FriendsTimelineView.get_videos_info(tweet_id, str(media_url))
            
            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "duration": tweet.video_duration,  
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image": profile_image,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
                "video_info": video_info,
                
            }
            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                    (original_tweet_id,),
                ).one()
                try:
                    user = User.objects.get(id=original_tweet.user_id)
                except User.DoesNotExist:
                    return Response(
                        {"message": "User does not exist"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                original_tweet_serializer = UserSerializer(user)
                original_tweet_username = original_tweet_serializer.data["username"]
                original_tweet_profile_image = original_tweet_serializer.data[
                    "profile_image"
                ]
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
                original_tweet_like_id = (
                    str(original_tweet_like.id) if original_tweet_like else None
                )
                media_url = original_tweet.image_urls
                video_info = FriendsTimelineView.get_videos_info(original_tweet_id, media_url)
        
                if original_tweet:
                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "duration": original_tweet.video_duration,  
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "username": original_tweet_username,
                        "profile_image": original_tweet_profile_image,
                        "video_info": video_info
                        
                    }
            timeline.append(tweet_details)

        return Response(
            {
                "likes": timeline,
                "page": page_number,
                "total_pages": paginator.num_pages,
                "total_tweets": paginator.count,
            },
            status=status.HTTP_200_OK,
        )


class GetUserRetweetsView(APIView):
    def get(self, request, user_id):
        session = get_session()
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
                "retweets": row.retweets,
            }
            for row in rows
            if row.retweet_id is not None
        ]
        return Response({"retweets": retweets}, status=status.HTTP_200_OK)

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
        page_number = request.GET.get("page")

        paginator = Paginator(tweets_list, 10)
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

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
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (tweet_id,),
            ).one()

            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response(
                    {"message": "User does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = UserSerializer(user)
            username = serializer.data["username"]
            profile_image = serializer.data["profile_image"]
            media_url = tweet.image_urls
            
            video_info = FriendsTimelineView.get_videos_info(tweet_id, str(media_url))

            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "duration": tweet.video_duration,
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image": profile_image,
                "isLiked": bool(like),
                "isRetweeted": bool(retweet),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
                "video_info": video_info if video_info else None,
            }

            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                    (original_tweet_id,),
                ).one()

                if original_tweet:
                    try:
                        original_user = User.objects.get(id=original_tweet.user_id)
                    except User.DoesNotExist:
                        return Response(
                            {"message": "User does not exist"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    original_serializer = UserSerializer(original_user)
                    original_tweet_username = original_serializer.data["username"]
                    original_tweet_profile_image = original_serializer.data["profile_image"]

                    original_tweet_like = session.execute(
                        "SELECT id FROM twitter.likes WHERE tweet_id = %s AND user_id = %s ALLOW FILTERING",
                        (original_tweet_id, user_id),
                    ).one()
                    original_tweet_like_id = str(original_tweet_like.id) if original_tweet_like else None

                    original_tweet_retweet = session.execute(
                        "SELECT id FROM twitter.tweets WHERE retweet_id = %s AND user_id = %s ALLOW FILTERING",
                        (original_tweet_id, user_id),
                    ).one()
                    original_tweet_delete_retweet_id = (
                        str(original_tweet_retweet.id) if original_tweet_retweet else None
                    )
                    
                    original_media_url = original_tweet.image_urls
                    original_video_info = FriendsTimelineView.get_videos_info(original_tweet_id, original_media_url)

                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content if original_tweet.content else "Original Tweet Deleted",
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "duration": original_tweet.video_duration,
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_like),
                        "isRetweeted": bool(original_tweet_retweet),
                        "like_id": original_tweet_like_id,
                        "delete_retweet_id": original_tweet_delete_retweet_id,
                        "username": original_tweet_username,
                        "profile_image": original_tweet_profile_image,
                        "video_info": original_video_info
                    }
                else:
                    tweet_details["original_tweet"] = {
                        "id": None,
                        "user_id": None,
                        "content": "Original tweet does not exist",
                        "created_at": None,
                        "retweet_id": None,
                        "image_urls": [],
                        "likes": 0,
                        "comments": 0,
                        "retweets": 0,
                        "isLiked": False,
                        "isRetweeted": False,
                        "like_id": None,
                        "delete_retweet_id": None,
                        "username": "Unknown User",
                        "profile_image": "default_profile_image_url",
                        "video_info": None,
                        "duration": None
                    }

            timeline.append(tweet_details)

        return Response(
            {
                "tweets": timeline,
                "page": page_number,
                "total_pages": paginator.num_pages,
                "total_tweets": paginator.count,
            },
            status=status.HTTP_200_OK,
        )
    def get_videos_info(tweet_id, video_urls):
        try:
            if "/video/" not in video_urls:
                logger.debug("not video")
                return None
            base_url = f"http://seaweedfsfiler:8888/tweets/{tweet_id}/video/?pretty=y"
                    
            response = requests.get(base_url, headers={"Accept": "application/json"})
            
            logger.error(response.json())
            logger.error(response.reason)
            logger.error(response.content)
            
            video_folders = response.json()
            logger.debug(f"video folders", video_folders)
            if not video_folders:
                logger.error(f"no video folders found for tweet {tweet_id}")
                return None
            
            all_video_info = []
            video_folders = video_folders['Entries']
            chunks_durations = []
            for video_folder in video_folders:
                folder_name = (video_folder['FullPath']).split('/')[-1]
                logger.debug(f"Folder name is {folder_name}")
                
                video_folder_url = f"http://seaweedfsfiler:8888/tweets/{tweet_id}/video/{folder_name}/?pretty=y"
                video_response = requests.get(video_folder_url, headers={"Accept": "application/json"})

                num_chunks = len(video_response.json()['Entries'])
                # for video_chunks in video_response.json()['Entries']:
                #     video_path = video_chunks['FullPath']
                #     video_duration = PostTweetView.get_duration(video_path)
                #     logger.debug(f'duration {video_duration}')
                #     chunks_durations.append(video_duration)
                    
                all_video_info.append({
                    'chunk_no': num_chunks,
                    'path': video_folder['FullPath'],
                    # 'durations': chunks_durations 
                })
            
            # for i,video_folder in video_folders:
                
            #     folder_name = video_folder.Enteries[i].FullPath
            #     folder_name = folder_name.split('/')[-1]
            #     logger.debug(f"Folder name is {folder_name}")
            #     video_folder_url = f"http://seaweedfsfiler:8888/tweets/{tweet_id}/video/{folder_name}/?pretty=y"

                
            #     video_response = requests.get(video_folder_url, headers={"Accept": "application/json"})

                
            #     video_info = video_response.json()

            #     if video_info:
                    
            #         all_video_info[folder_name] = video_info
            #     else:
            #         logger.error(f"no video info found in folder {folder_name}")
            
            
            logger.debug(f"All video info: {json.dumps(all_video_info)}")
            return all_video_info

        except requests.RequestException as e:
            logger.error(f"Failed to get video info: {str(e)}")
            raise Exception(f"Failed to get video info for tweet {tweet_id}")



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
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (tweet_id,),
            ).one()

            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response(
                    {"message": "User does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = UserSerializer(user)
            username = serializer.data["username"]
            profile_image = serializer.data["profile_image"]
            media_url = tweet.image_urls
            video_info = FriendsTimelineView.get_videos_info(tweet_id, str(media_url))
            
            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "duration": tweet.video_duration,  
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image": profile_image,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
                "video_info": video_info if video_info else None,
                
            }

            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                    (original_tweet_id,),
                ).one()
                try:
                    user = User.objects.get(id=original_tweet.user_id)
                except User.DoesNotExist:
                    return Response(
                        {"message": "User does not exist"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                original_tweet_serializer = UserSerializer(user)
                original_tweet_username = original_tweet_serializer.data["username"]
                original_tweet_profile_image = original_tweet_serializer.data[
                    "profile_image"
                ]
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
                original_tweet_like_id = (
                    str(original_tweet_like.id) if original_tweet_like else None
                )
                media_url = original_tweet.image_urls
                video_info = FriendsTimelineView.get_videos_info(original_tweet_id, media_url)
        
        
                if original_tweet:
                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "duration": original_tweet.video_duration,  
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "username": original_tweet_username,
                        "profile_image": original_tweet_profile_image,
                        "video_info": video_info
                        
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
                "retweets": row.retweets,
            }
            for row in rows
            if row.retweet_id is not None
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
            tweet = session.execute(
                "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (tweet_id,),
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
                "SELECT retweet_id FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                (tweet_id,),
            ).one()
            try:
                user = User.objects.get(id=tweet.user_id)
            except User.DoesNotExist:
                return Response(
                    {"message": "User does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = UserSerializer(user)
            username = serializer.data["username"]
            profile_image = serializer.data["profile_image"]
            media_url = tweet.image_urls
            video_info = FriendsTimelineView.get_videos_info(tweet_id, str(media_url))
            
            tweet_details = {
                "id": tweet_id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "created_at": tweet.created_at,
                "retweet_id": tweet.retweet_id,
                "image_urls": tweet.image_urls,
                "duration": tweet.video_duration,  
                "likes": tweet.likes,
                "comments": tweet.comments,
                "retweets": tweet.retweets,
                "username": username,
                "profile_image": profile_image,
                "isLiked": bool(isLiked),
                "isRetweeted": bool(isRetweeted),
                "like_id": like_id,
                "delete_retweet_id": delete_retweet_id,
                "video_info": video_info if video_info else None,
                
            }
            if result and result.retweet_id:
                original_tweet_id = result.retweet_id
                original_tweet = session.execute(
                    "SELECT * FROM twitter.tweets WHERE id = %s ALLOW FILTERING",
                    (original_tweet_id,),
                ).one()
                try:
                    user = User.objects.get(id=original_tweet.user_id)
                except User.DoesNotExist:
                    return Response(
                        {"message": "User does not exist"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                original_tweet_serializer = UserSerializer(user)
                original_twfeet_username = original_tweet_serializer.data["username"]
                original_tweet_profile_image = original_tweet_serializer.data[
                    "profile_image"
                ]
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
                original_tweet_like_id = (
                    str(original_tweet_like.id) if original_tweet_like else None
                )
                media_url = original_tweet.image_urls
                video_info = FriendsTimelineView.get_videos_info(original_tweet_id, media_url)
        
                if original_tweet:
                    tweet_details["original_tweet"] = {
                        "id": str(original_tweet_id),
                        "user_id": original_tweet.user_id,
                        "content": original_tweet.content,
                        "created_at": original_tweet.created_at,
                        "retweet_id": original_tweet.retweet_id,
                        "image_urls": original_tweet.image_urls,
                        "duration": original_tweet.video_duration,  
                        "likes": original_tweet.likes,
                        "comments": original_tweet.comments,
                        "retweets": original_tweet.retweets,
                        "isLiked": bool(original_tweet_isLiked),
                        "isRetweeted": bool(original_tweet_isRetweeted),
                        "like_id": original_tweet_like_id,
                        "username": original_tweet_username,
                        "profile_image": original_tweet_profile_image,
                        "video_info": video_info
                        
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
                "retweets": row.retweets,
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
#                 # 'id': hit.id,
#                 # 'user_id': hit.user_id,
#                 'content': hit.content,
#                 # 'created_at': hit.created_at
#             })

#         return Response({'tweets': tweets}, status=status.HTTP_200_OK)

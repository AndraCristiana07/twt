from django.urls import path
# from .views import post_tweet, get_tweets
from . import views

urlpatterns = [
    path('post/', views.PostTweetView.as_view(), name='post_tweet'),
    path('get/', views.GetTweetsView.as_view(), name='get_tweets'),
    path('get_tweet/<uuid:tweet_id>', views.GetSingleTweetView.as_view(), name='get_tweet'),
    path('delete/<uuid:tweet_id>', views.DeleteTweetView.as_view(), name='delete_tweet'),
    path('like/<uuid:tweet_id>', views.LikeTweetView.as_view(), name='like_tweet'),
    path('unlike/<uuid:like_id>', views.UnlikeTweetView.as_view(), name='unlike_tweet'),
    path('comment/<uuid:tweet_id>', views.PostCommentView.as_view(), name='comment'),
    path('get_comments_for_tweet/<uuid:tweet_id>', views.GetCommentsView.as_view(), name='get_comments_for_tweet'),
    path('delete_comment/<uuid:comment_id>', views.DeleteCommentView.as_view(), name='delete_comment'),
    path('like_comment/<uuid:comment_id>', views.LikeCommentView.as_view(), name='like_comment'),
    path('unlike_comment/<uuid:comment_id>', views.UnlikeCommentView.as_view(), name='unlike_comment'),
    # path('get_all_likes', views.GetAllLikesView.as_view(), name='get_all_likes'),
    path('get_likes_per_tweet/<uuid:tweet_id>', views.GetLikesPerTweetView.as_view(), name='get_likes_per_tweet'),
    # path('get_likes_per_comment/<uuid:comment_id>', views.GetLikesPerCommentView.as_view(), name='get_likes_per_comment'),
    path('retweet/<uuid:tweet_id>', views.RetweetView.as_view(), name='retweet'),
    path('unretweet/<uuid:retweet_id>', views.DeleteRetweetView.as_view(), name='unretweet'),
    path('retweet_comment/<uuid:comment_id>', views.RetweetCommentView.as_view(), name='retweet_comment'),
    # path('unretweet_comment/<uuid:retweet_id>', views.DeleteRetweetCommentView.as_view(), name='unretweet_comment'),
    path('get_retweets/<uuid:tweet_id>', views.GetRetweetsView.as_view(), name='get_retweets'),
    path('get_user_tweets/<user_id>', views.GetUserTweetsView.as_view(), name='get_user_tweets'),
    path('get_user_likes/<user_id>', views.GetUserLikesView.as_view(), name='get_user_likes'),
    path('get_user_comments/<user_id>', views.GetUserCommentsView.as_view(), name='get_user_comments'),
    path('get_user_retweets/<user_id>', views.GetUserRetweetsView.as_view(), name='get_user_retweets'),
    path('following_timeline/', views.FriendsTimelineView.as_view(), name='following_timeline'),
    path('user_timeline/', views.UserTimelineView.as_view(), name='user_timeline'),
]
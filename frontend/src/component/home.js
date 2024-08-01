import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../css/home.css";
import Menu from "./drawer";
import axios from 'axios';
import { TweetCard } from "./tweetCard";
import { useNavigate } from "react-router-dom";
export const Home = () => {
    const [tweets, setTweets] = useState([]);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    ;
    console.log("aa" + localStorage.getItem('user_id'));

    useEffect(() => {
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
        } else {
            fetchAllTweets();
        }
    });

    const fetchAllTweets = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/tweets/get/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            console.log(response.data);
            const tweetIds = response.data.tweets.map(tweet => tweet.id);
            const detailedTweets = await Promise.all(tweetIds.map(fetchTweetData));
            setTweets(detailedTweets);
            console.log(detailedTweets);
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
            }
        }
    };

    const fetchTweetData = async (tweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/tweets/get_tweet/${tweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            const tweet = response.data;
            tweet.comments = tweet.comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            tweet.isLiked = tweet.likes.some(like => like.user_id === localStorage.getItem('user_id'));
            tweet.isRetweeted = tweet.retweets.some(retweet => retweet.user_id === localStorage.getItem('user_id'));
            tweet.isBookmarked = tweet.bookmarks.some(bookmark => bookmark.user_id === localStorage.getItem('user_id'));
            return tweet;
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
            }
            return null;
        }
    };

    const handleLike = async (tweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/like/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, likes: [...tweet.likes, { id: response.data.like_id, user_id: localStorage.getItem('user_id') }], isLiked: true } : tweet
            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlike = async (tweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const likeId = tweets.find(tweet => tweet.id === tweetId).likes.find(like => like.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, likes: tweet.likes.filter(like => like.user_id !== localStorage.getItem('user_id')), isLiked: false } : tweet
            ));
            
        } catch (error) {
            console.log(error);
        }
    };

    const handleRetweet = async (tweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/retweet/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, retweets: [...tweet.retweets, { id: response.data.retweet_id, user_id: localStorage.getItem('user_id') }], isRetweeted: true } : tweet
            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnretweet = async (tweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const retweetId = tweets.find(tweet => tweet.id === tweetId).retweets.find(retweet => retweet.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, retweets: tweet.retweets.filter(retweet => retweet.user_id !== localStorage.getItem('user_id')), isRetweeted: false } : tweet
            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleBookmark = async (tweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/bookmark/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, bookmarks: [...tweet.bookmarks, { id: response.data.bookmark_id, user_id: localStorage.getItem('user_id') }], isBookmarked: true } : tweet
            ));
        } catch (error) {
            console.log(error);
        }
    };
    
    const handleRemoveBookmark = async (tweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const bookmark = tweets.find(tweet => tweet.id === tweetId).bookmarks.find(bookmark => bookmark.user_id === localStorage.getItem('user_id'));
            if (!bookmark) {
                console.log("Bookmark not found");
                return;
            }
            await axios.delete(`${apiUrl}/tweets/delete_bookmark/${bookmark.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, bookmarks: tweet.bookmarks.filter(bookmark => bookmark.user_id !== localStorage.getItem('user_id')), isBookmarked: false } : tweet
            ));
        } catch (error) {
            console.log(error);
        }
    };
    

    return (
        <Container fluid style={{position:"relative"}}>
           
            <Row>
                <Col xs={2} style={{position:"fixed", height:"100vh", overflow:"auto"}}>
                    <Menu />
                </Col>
                <Col xs={{span:9, offset:2}}>
                    <Row>
                        <Col>
                            <Button onClick={() => navigate('/')} style={{color:"black", border:"none", width:"17vh"}}>For you</Button>
                        </Col>
                        <Col>
                            <Button onClick={() => navigate('/following')} style={{background:"transparent", color:"black", border:"none", width:"17vh"}}>Following</Button>
                        </Col>
                    </Row>
                    <Container className="container mt-5 text-center">
                        {Array.isArray(tweets) && tweets.length > 0 ? (
                            tweets.map(tweet => (
                                <TweetCard 
                                    key={tweet.id} 
                                    tweet={tweet}
                                    handleLike={handleLike}
                                    handleUnlike={handleUnlike}
                                    handleRetweet={handleRetweet}
                                    handleUnretweet={handleUnretweet}
                                    handleBookmark={handleBookmark}
                                    handleRemoveBookmark={handleRemoveBookmark}
                                />
                            ))
                        ) : (
                            <p>No tweets available.</p>
                        )}
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};

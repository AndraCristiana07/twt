import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import "../css/home.css";
import Menu from "./drawer";
import axios from 'axios';
import media from '../assets/media.svg';
import { TweetCard } from "./tweetCard";
import { useNavigate } from "react-router-dom";

export const FollowingTimeline = () => {
    const [tweets, setTweets] = useState([]);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
        } else {
            fetchAllTweets();
        }
    }, []);

    const fetchAllTweets = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/tweets/following_timeline/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            setTweets(response.data.tweets)
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
            }
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

            // setTweets(tweets.map(tweet =>
            //     tweet.id === tweetId ? { ...tweet, likes: tweet.likes + 1, isLiked: true } : tweet
            // ));
            setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? { ...tweet, isLiked: true, likes: tweet.likes + 1 } : tweet));
       
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlike = async (tweetId, likeId) => {
        try {
            // const likeId = tweets.find(tweet => tweet.id === tweetId).like_id
            
            const accessToken = localStorage.getItem('access_token');
            await axios.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            // setTweets(tweets.map(tweet =>
            //     tweet.id === tweetId ? { ...tweet, likes: tweet.likes - 1, isLiked: false } : tweet
            // ));
            setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? { ...tweet, isLiked: false, likes: tweet.likes - 1 } : tweet));
        } catch (error) {
            console.log(error);
        }
    };

    const handleRetweet = async (tweetId, originalTweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/retweet/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            // setTweets(tweets.map(tweet =>
            //     tweet.id === tweetId || originalTweetId? { ...tweet, retweets: tweet.retweets + 1, isRetweeted: true } : tweet
            // ));
            setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? { ...tweet, isRetweeted: true, retweets: tweet.retweets + 1 } : tweet));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnretweet = async (tweetId, retweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axios.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            // setTweets(tweets.map(tweet =>
            //     tweet.id === tweetId ? { ...tweet, retweets: tweet.retweets - 1, isRetweeted: false } : tweet
            // ));
            setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? { ...tweet, isRetweeted: false, retweets: tweet.retweets - 1 } : tweet));
        } catch (error) {
            console.log(error);
        }
    };

    const [content, setContent] = useState("");
    const [files, setFiles] = useState([])
    const handleTweetPost = async (e) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem('access_token');
            const formData = new FormData();
            for(let i=0; i<files.length; i++) {
                formData.append(`images`, files[i]);
            }
            formData.append(`content`, content);
            
            const response = await axios.post(
                `${apiUrl}/tweets/post`,
                // { content: content,},
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                }
            );

            // setTweets([response.data, ...tweets]);
            // setContent("");
        } catch (error) {
            console.error('Error posting tweet:', error);
        }
    };

    
    return (
        <Container fluid style={{position:"relative"}}>
            <Row>
                <Col xs={2} style={{position:"fixed", height:"100vh", overflow:"auto"}}>
                    <Menu />
                </Col>
                <Col xs={{span:9, offset:2}}>
                    <Container fluid>
                        <Card className="mt-5">
                            <Card.Body>
                                <Form onSubmit={handleTweetPost}>
                                    <Form.Group controlId="formTweet">
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={content}
                                        placeholder="What's happening?"
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                    />
                                    </Form.Group>
                                    <div style={{position:"relative", width: '4vw', height: '4vh' }}>
                                        <input  onChange={(e)=> {setFiles(e.target.files)}} type="file" multiple  
                                        style={{
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            zIndex: 2,
                                            cursor: 'pointer'
                                        }} />
                                        <img src={media} alt="media" title="media content" 
                                         style={{
                                            width: '100%', 
                                            height: '100%', 
                                            position: 'absolute',
                                            zIndex: 1
                                        }} />

                                    </div>
                                 
                                    <Button variant="primary" type="submit">
                                        Post Tweet
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Container>
                    <Container  className="container mt-5 text-center">
                        {Array.isArray(tweets) && tweets.length > 0 ? (
                            tweets.map(tweet => (
                                <TweetCard 
                                    key={tweet.id} 
                                    tweet={tweet}
                                    handleLike={handleLike}
                                    handleUnlike={handleUnlike}
                                    handleRetweet={handleRetweet}
                                    handleUnretweet={handleUnretweet}
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

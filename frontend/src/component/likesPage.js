import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import Button from '@mui/material/Button'; 
import axios from 'axios';
import deleteImg from '../assets/delete.svg';
import back from "../assets/back-arrow.svg";
import heart from "../assets/heart.svg";
import heartred from "../assets/heart-red.svg";
import comment from "../assets/comment.svg";
import retweet from "../assets/retweet.svg";
import retweetred from "../assets/retweet-red.svg";
import Menu from "./drawer";
import { Comment } from "./commentPost";
import { DeleteDialog } from "./deleteDialog";
import "../css/home.css";
import { teal } from "@mui/material/colors";

export const LikesPage = () => {
    const [tweets, setTweets] = useState([]);
    const [showPostCommentDialog, setShowPostCommentDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tweetIdToDelete, setTweetIdToDelete] = useState(null);
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [user, setUser] = useState({});
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false); 

    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
        } else {
            fetchTweets();
            fetchFollowers();
            fetchFollowing();
        }
    }, []);

    const fetchFollowers = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/get_followers/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setFollowers(response.data);
            // setIsFollowing(isFollowing);
        } catch (error) {
            console.error('Error fetching followers:', error);
        }
    };
    
    const fetchFollowing = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/get_following/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setFollowing(response.data);
        } catch (error) {
            console.error('Error fetching following:', error);
        }
    };

    const fetchTweets = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/tweets/get_curr_user_likes`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
    
            if (Array.isArray(response.data.likes)) {
                const sortedTweets = response.data.likes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setTweets(sortedTweets);
            } else {
                console.error('Response data structure is unexpected:', response.data);
            }
        } catch (error) {
            console.error(error);
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
            if(tweet == null){
                return {unavailable: true};
            }
            const userResponse = await axios.get(`${apiUrl}/get_specific_user/${tweet.user_id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            tweet.username = userResponse.data.username;
            
            return tweet;
        } catch (error) {
            console.error('Error fetching tweet data:', error);
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
                tweet.id === tweetId ? { ...tweet, likes: tweet.likes + 1, isLiked: true } : tweet

                // tweet.id === tweetId ? { ...tweet, likes: [...tweet.likes, { id: response.data.like_id, user_id: localStorage.getItem('user_id') }], isLiked: true } : tweet
            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlike = async (tweetId, likeId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            // const likeId = tweets.find(tweet => tweet.id === tweetId).likes.find(like => like.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, likes: tweet.likes - 1, isLiked: false } : tweet

                // tweet.id === tweetId ? { ...tweet, likes: tweet.likes.filter(like => like.user_id !== localStorage.getItem('user_id')), isLiked: false } : tweet
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
                tweet.id === tweetId ? { ...tweet, retweets: tweet.retweets + 1, isRetweeted: true } : tweet

                // tweet.id === tweetId ? { ...tweet, retweets: [...tweet.retweets, { id: response.data.retweet_id, user_id: localStorage.getItem('user_id') }], isRetweeted: true } : tweet
            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnretweet = async (tweetId, retweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            // const retweetId = tweets.find(tweet => tweet.id === tweetId).retweets.find(retweet => retweet.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, retweets: tweet.retweets - 1, isRetweeted: false } : tweet

                // tweet.id === tweetId ? { ...tweet, retweets: tweet.retweets.filter(retweet => retweet.user_id !== localStorage.getItem('user_id')), isRetweeted: false } : tweet
            ));
        } catch (error) {
            console.log(error);
        }
    };


    const countLikes = (tweet) => tweet.likes ? tweet.likes.length : 0;
    const countRetweets = (tweet) => tweet.retweets ? tweet.retweets.length : 0;
    const countComments = (tweet) => tweet.comments ? tweet.comments.length : 0;

    const handleOpenDeleteDialog = (tweetId) => {
        setTweetIdToDelete(tweetId);
        setShowDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false);
        setTweetIdToDelete(null);
    };

    const handleOpenDialog = () => {
        setShowPostCommentDialog(true);
    };

    const handleCloseDialog = () => {
        setShowPostCommentDialog(false);
    };

    return (
        <Container fluid className="mt-5 text-center" style={{position:"relative"}}>
            <Row>
                <Col  xs={2} style={{position:"fixed", height:"100vh", overflow:"auto"}}>
                    <Menu />
                </Col>
                <Col xs={{span:9, offset:2}}>
                    <Container fluid>
                        <Row>
                            <Col xs={2}>
                                <img src={back} alt="Back" width={"20px"} onClick={() => navigate(-1)} />
                            </Col>
                            <Col xs={8}>
                                <h4>User: {userId}</h4>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={8}>
                                <img src="" alt="twt header" style={{ width: "200px" }} />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={3}>
                                <img src="" alt="Profile pic" />
                            </Col>
                            <Col xs={9}>
                                <Button>Edit profile</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                <h4>{userId}</h4>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                <p>@{user.username}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                <p>Sample bio</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                <p>Following</p>
                                <p>{following.length} </p>
                            </Col>
                            <Col xs={4}>
                                <p>Followers</p>
                                <p>{followers.length} </p>
                            </Col>
                            <Col xs={4}>
                                <p>Tweets</p>
                                <p>{tweets.length}</p>
                            </Col>
                        </Row>
                    </Container>
                    <Container fluid>
                        <Row>
                            <Col>
                                <Button style={{color:"grey"}} onClick={()=>navigate('/profile')}>Posts</Button>
                            </Col>
                            <Col>
                                <Button style={{color:"grey"}} onClick={()=>navigate("/replies")}>Replies</Button>
                            </Col>
                            <Col>
                                <Button style={{textDecoration:"underline", textDecorationThickness:"4px", color:"black", textDecorationColor:"blue"}} onClick={()=>navigate("/likes")}>Likes</Button>
                            </Col>
                        </Row>
                    </Container>

                    {tweets.length > 0 ? (
                        tweets.map(tweet => (
                            <div>
                                {tweet.unavailable ? (
                                    <Card key={tweet.id} className="mb-4 tweet-card">
                                    <Card.Body>
                                        <Card.Text>Tweet unavailable</Card.Text>
                                    </Card.Body>
                                </Card>
                                ) : (
                                <Card key={tweet.id} className="mb-4 tweet-card" onClick={() => navigate(`/tweet/${tweet.id}`)}>
                                    <Card.Body>
                                        <Container fluid>
                                            <Row>
                                                <Col xs={7}>
                                                    <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`) }}>
                                                        {tweet.user_id} @{tweet.username}
                                                    </Card.Title>
                                                </Col>
                                                {/* <Col xs={2}>
                                                    <img src={deleteImg} style={{ width: "30px" }} alt="Delete" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(tweet.id); }}></img>
                                                </Col>
                                                <DeleteDialog show={showDeleteDialog} handleClose={handleCloseDeleteDialog} handleDelete={handleDeleteTweet} /> */}
                                            </Row>
                                        </Container>
                                        <Card.Text>{tweet.content}</Card.Text>
                                        <Card.Subtitle className="text-muted">
                                            Created at: {new Date(tweet.created_at).toLocaleString()}
                                        </Card.Subtitle>
                                    </Card.Body>
                                    <Row>
                                        <Button className="btn" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); handleOpenDialog(); }}>
                                            <img src={comment} alt="Comment" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{tweet.comments}</span>
                                        </Button>
                                        <Button className="btn" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id) : handleLike(tweet.id, tweet.like_id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                            <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{tweet.likes}</span>
                                        </Button>
                                        <Button className="btn" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.isRetweeted ? handleUnretweet(tweet.id, tweet.retweet_id) : handleRetweet(tweet.id); }}>
                                            <img src={tweet.isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                        </Button>
                                    </Row>
                                    <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} />
                                </Card>
                                )}

                            </div>

                        ))
                    ) : (
                        <p>No tweets available.</p>
                    )}
                </Col>
            </Row>
        </Container>
    );
};
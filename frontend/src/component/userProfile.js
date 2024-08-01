import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import back from "../assets/back-arrow.svg";
import heart from "../assets/heart.svg";
import heartred from "../assets/heart-red.svg";
import comment from "../assets/comment.svg";
import retweet from "../assets/retweet.svg";
import retweetred from "../assets/retweet-red.svg"
import { Comment } from "./commentPost";
import Menu from "./drawer";

const UserProfile = () => {
    const [tweets, setTweets] = useState([]);
    const [retweets, setRetweets] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const { userId } = useParams();
    const [user, setUser] = useState({});
    const currUser = localStorage.getItem('user_id')
    const [showPostCommentDialog, setShowPostCommentDialog] = React.useState(false);

    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleOpenDialog = () => {
        setShowPostCommentDialog(true);
    };

    const handleCloseDialog = () => {
        setShowPostCommentDialog(false);
    };

    useEffect(() => {
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
        } else {
            fetchUserInfo();
            fetchUserTweets();
            // fetchUserTweets(userId);
            // fetchRetweets(userId);
            fetchFollowers();
            fetchFollowing();
        }
    }, []);
    
    const fetchUserInfo = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/get_specific_user/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const fetchUserTweets = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const responseTweets = await axios.get(`${apiUrl}/tweets/get_user_tweets/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const tweets = responseTweets.data.tweets;
            setTweets(tweets);
            
           
        } catch (error) {
            console.error('Error fetching tweets:', error);
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
                withCredentials:true
            });
            const tweet = response.data;
            // tweet.comments = tweet.comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            // tweet.isLiked = tweet.likes.some(like => like.user_id === localStorage.getItem('user_id'));
            // tweet.isRetweeted = tweet.retweets.some(retweet => retweet.user_id === localStorage.getItem('user_id'));
           
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
            ));
        } catch (error) {
            console.error(error);
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
                // tweet.id === tweetId ? { ...tweet, likes: tweet.likes.filter(like => like.user_id !== localStorage.getItem('user_id')), isLiked: false } : tweet
                tweet.id === tweetId ? { ...tweet, likes: tweet.likes - 1, isLiked: false } : tweet
                
            ));
            
        } catch (error) {
            console.error(error);
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
            console.error(error);
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
            console.error(error);
        }
    };

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
            const isFollowing = response.data.some(follower => follower.follower_id === currUser);
            setFollowers(response.data);
            setIsFollowing(isFollowing);
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

    const handleFollow = async () => {
        if(currUser === userId)
            return;
        try {
            const accessToken = localStorage.getItem('access_token');
            await axios.post(`${apiUrl}/follow/${userId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setIsFollowing(true);
            // fetchFollower(userId);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };
    const handleUnfollow = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axios.post(`${apiUrl}/unfollow/${userId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setIsFollowing(false);
            // fetchFollower(userId);
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };
    


    const getLikes = (tweet) => {
        return tweet.likes;
    }

    const getRetweets = (tweet) => {
        return tweet.retweets;
    }

    const getComments = (tweet) => {
        return tweet.comments;
    }

   

    return (
        <Container fluid style={{position:"relative"}}>
            <Row>
                <Col xs={2} style={{position:"fixed", height:"100vh", overflow:"auto"}}>
                    <Menu />
                </Col>
                <Col xs={{span:9, offset:2}}>
                    <Container className="container">
                        <Row>
                            <Col>
                                <div className="mt-5 text-center">
                                    <Container fluid>
                                        <Row>
                                            <Col xs={2}>
                                                <img src={back} alt="Back" width={"20px"} onClick={() => navigate(-1)} />
                                            </Col>
                                            <Col xs={8}>
                                                <h4> {userId}</h4>
                                            </Col>
                                            <Col xs={2}>
                                                <Button className='btn' onClick={isFollowing ? handleUnfollow : handleFollow}>{isFollowing ? 'Unfollow': 'Follow'}</Button>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs={8}>
                                                <img  src="" alt="twt header" style={{width:"200px"}} />
                                            </Col>

                                        </Row>
                                        <Row>
                                            <Col xs={3}>

                                                <img src="" alt="Profile pic" />
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
                                                <p>{following.length}</p>
                                            </Col>
                                            <Col xs={4}>
                                                <p>Followers</p>
                                                <p>{followers.length}</p>
                                            </Col>
                                            <Col xs={4}>
                                                <p>Tweets</p>
                                                <p>{tweets.length}</p>
                                            </Col>
                                        </Row>
                                    </Container>
                                   
                                    {tweets.length > 0 ? (
                                        tweets.map(tweet => (
                                            <Card key={tweet.id}  onClick={() => navigate(`/tweet/${tweet.id}`)} className="mb-4 tweet-card"
                                               >
                                                <Card.Body >
                                                    <Container fluid>
                                                        <Row>
                                                            <Col xs={6}>
                                                                <Card.Title onClick={(e)=>{ e.stopPropagation() ;navigate(`/profile/${tweet.user_id}`)}}>{tweet.user_id} @{tweet.username}</Card.Title>
                                                            </Col>
                                                            
                                                        </Row>
                                                    </Container>
                                                   
                                                    <Card.Text>{tweet.content}</Card.Text>
                                                    <Card.Subtitle className="text-muted">
                                                        Created at: {new Date(tweet.created_at).toLocaleString()}
                                                    </Card.Subtitle>
                                                    
                                                </Card.Body>
                                                <Row>
                                                    <Button className="btn" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => {e.stopPropagation(); handleOpenDialog(); }}>
                                                        <img src={comment} alt="Comment" width={"20px"} />
                                                        <span style={{ color: "black" }} className="ms-1">{getComments(tweet)}</span>
                                                    </Button>
                                                    <Button className="btn" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id, tweet.like_id) : handleLike(tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                                        <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                                        <span style={{ color: "black" }} className="ms-1">{getLikes(tweet)}</span>
                                                    </Button>
                                                    <Button className="btn" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.isRetweeted ? handleUnretweet(tweet.id, tweet.retweet_id) : handleRetweet(tweet.id); }}>
                                                        <img src={tweet.isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                                        <span style={{ color: "black" }} className="ms-1">{getRetweets(tweet)}</span>
                                                    </Button>
                                                </Row>
                                                <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} />
                                            </Card>
                                        ))
                                    ) : (
                                        <p>No tweets available.</p>
                                    )}
                                    
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};

export default UserProfile;
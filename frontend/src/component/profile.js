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

export const Profile = () => {
    const [tweets, setTweets] = useState([]);
    const [showPostCommentDialog, setShowPostCommentDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tweetIdToDelete, setTweetIdToDelete] = useState(null);
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    // const [retweets, setRetweets] = useState([])
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false); 
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;

    useEffect(() => {
        setLoading(true)
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
        } else {
            fetchTweets();
            fetchFollowers();
            fetchFollowing();
            // fetchRetweets();
            
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
            // setLoading(false);
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
            // setLoading(false);
        } catch (error) {
            console.error('Error fetching following:', error);
        }
    };

    const fetchTweets = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const responseTweets = await axios.get(`${apiUrl}/tweets/user_timeline/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            const tweets = responseTweets.data.tweets;
           
            setTweets(tweets);
            var images = [];
            for(const tweet of tweets){
                for (const url of tweet.image_urls) {
                    var img = await imageFetch(url);
                    images.push(img);
                }
                setImages(images);
            }
            
            setLoading(false);
          
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
            }
        }
    };
    const handleImageNav = (tweet, index) => {
        console.log(tweet.image_urls)
        console.log(tweet.image_urls[index])
        navigate(`/tweet/${tweet.id}/images/${index}`);
    }

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

                ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteTweet = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axios.delete(`${apiUrl}/tweets/delete/${tweetIdToDelete}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
            });
            setTweets(tweets.filter(tweet => tweet.id !== tweetIdToDelete));
            handleCloseDeleteDialog();
        } catch (error) {
            console.log(error);
        }
    };

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

    const imageFetch = async (path) => {
        const url = `${seaweedUrl}${path}`
        const accessToken = localStorage.getItem('access_token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            responseType: 'blob'
        };
        const response = await axios.get(url, config);
        return URL.createObjectURL(response.data)
    }
   

    const [images, setImages] = useState([])

   

    return (
        <Container fluid className="mt-5 text-center"  style={{position:"relative"}}>
            <Row >
                <Col xs={2} style={{position:"fixed", height:"100vh", overflow:"auto", borderRight:"1px solid black"}}>
                    <Menu />
                </Col>

                <Col xs={{span:9, offset:2}}>

                    <Container fluid style={{}}>
                        <Row style={{position:"fixed", backgroundColor: "white",width:"100vw", overflow:"auto", }}>
                            <Col xs={2}>
                                <img src={back} alt="Back" width={"20px"} onClick={() => navigate(-1)} />
                            </Col>
                            <Col xs={8}>
                                <h4> {username}</h4>
                            </Col>
                        </Row>
                        <Row style={{marginTop: "10vh"}} >
                            <Col xs={8}>
                                <img src="" alt="twt header" style={{ width: "200px", marginTop:"100px" }} />
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
                                <p>@{username}</p>
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
                                <Button style={{textDecoration:"underline", textDecorationThickness:"4px", color:"black", textDecorationColor:"blue"}} onClick={()=>navigate('/profile')}>Posts</Button>
                            </Col>
                            <Col>
                                <Button style={{color:"grey"}} onClick={()=>navigate("/replies")}>Replies</Button>
                            </Col>
                            <Col>
                                <Button style={{color:"grey"}} onClick={()=>navigate("/likes")}>Likes</Button>
                            </Col>
                        </Row>
                    </Container>
                    {loading ? <p> Loading... </p> : (
                        <div>

                        {tweets.length > 0 ? (
                            tweets.map(tweet => (
                                <Card key={tweet.id} className="mb-4 tweet-card" onClick={() => navigate(`/tweet/${tweet.id}`)}>
                                    {tweet.retweet_id !== null && (
                                        <Card.Body>
                                        <Container fluid>
                                            <Row>
                                                <Col xs={10}>
                                                <img src={retweet} alt='Retweet' style={{width:"2vw"}}/>
                                                <p>{tweet.username} has retweeted</p>
                                                </Col>
                                            </Row>
                                            {(!tweet.content && !tweet.image_urls) && (
                                                <Container fluid>
                                                    <Row>
                                                        
                                                        <Col xs={6}>
                                                            <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`) }}>
                                                                {tweet.original_tweet.user_id} @{tweet.original_tweet.username}
                                                            </Card.Title>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Card.Text>
                                                            {tweet.original_tweet.content}
                                                        </Card.Text>
                                                    </Row>
                                                    <Row>
                                                        {tweet.original_tweet.image_urls && (
                                                            <div className="image-grid" data-count={tweet.original_tweet.image_urls.length}>
                                                            {tweet.original_tweet.image_urls.map((image, index) => (
                                                                <img key={index} src={images[index]} alt="tweet image" className="grid-image" 
                                                                onClick={(e) => {e.stopPropagation(); console.log(`selected image ${index}`); handleImageNav(tweet, index)}}
                                                                />
                                                            ))}
                                                            </div>
                                                        )}
                                                        </Row>
                                                    <Row>
                                                        <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                                                            <img src={comment} alt="Comment" width={"20px"} />
                                                            <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.comments}</span>
                                                        </Button>
                                                        <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.original_tweet.id, tweet.original_tweet.like_id) : handleLike(tweet.original_tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                                            <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                                            <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.likes}</span>
                                                        </Button>
                                                        <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.isRetweeted ? handleUnretweet(tweet.original_tweet.id, tweet.original_tweet.retweet_id) : handleRetweet(tweet.original_tweet.id); }}>
                                                            <img src={tweet.isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                                            <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.retweets}</span>
                                                        </Button>
                                                    </Row>
                                                    <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.original_tweet.id} />
                                            
                                                    
                                                </Container>
                                            )}
                                            {(tweet.content !== "" || tweet.image_urls) && (
                                                <div>
                                                    <Row>
                                                        <Col> {tweet.content}
                                                        </Col>
                                                    </Row>
                                                    <Card>
                                                        <Row>
                                                            <Col></Col>
                                                            <Col xs={6}>
                                                                <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`) }}>
                                                                    {tweet.original_tweet.user_id} @{tweet.original_tweet.username}
                                                                </Card.Title>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Card.Text>
                                                                {tweet.original_tweet.content}
                                                            </Card.Text>
                                                        </Row>
                                                        <Row>
                                                            {tweet.image_urls && (
                                                                <div className="image-grid" data-count={tweet.image_urls.length}>
                                                                    {tweet.image_urls.map((image, index) => (
                                                                        <img key={index} src={images[index]} alt="tweet image" className="grid-image" 
                                                                        // onClick={(e) => {e.stopPropagation(); setShowModal(true); setModalIndex(index);}}
                                                                        onClick={(e) => {e.stopPropagation(); console.log(index); handleImageNav(tweet, index)}}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </Row>
                                                        <Row>
                                                            <Card.Subtitle className="text-muted">
                                                                Created at: {new Date(tweet.created_at).toLocaleString()}
                                                            </Card.Subtitle>
                                                        </Row>
                                                        
                                                    </Card>
                                                    <Row>
                                                        <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                                                            <img src={comment} alt="Comment" width={"20px"} />
                                                            <span style={{ color: "black" }} className="ms-1">{tweet.comments}</span>
                                                        </Button>
                                                        <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id, tweet.like_id) : handleLike(tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                                            <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                                            <span style={{ color: "black" }} className="ms-1">{tweet.likes}</span>
                                                        </Button>
                                                        <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.isRetweeted ? handleUnretweet(tweet.id, tweet.retweet_id) : handleRetweet(tweet.id); }}>
                                                            <img src={tweet.isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                                            <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                                        </Button>
                                                    </Row>
                                                
                                                </div>


                                            )}
                                        </Container>
                                        <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} />

                                    </Card.Body>
                                    
                                    )}
                                    {tweet.retweet_id === null && (
                                        <div>

                                            <Card.Body>
                                                <Container fluid>
                                                    <Row>
                                                        <Col xs={7}>
                                                            <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`) }}>
                                                                {tweet.user_id} @{tweet.username}
                                                            </Card.Title>
                                                        </Col>
                                                        <Col xs={2}>
                                                            <img src={deleteImg} style={{ width: "30px" }} alt="Delete" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(tweet.id); }}></img>
                                                        </Col>
                                                    </Row>
                                                </Container>
                                                <Card.Text>{tweet.content}</Card.Text>
                                                <Row>
                                                    {tweet.image_urls && (
                                                        <div className="image-grid" data-count={tweet.image_urls.length}>
                                                            {tweet.image_urls.map((image, index) => (
                                                                <img key={index} src={images[index]} alt="tweet image" className="grid-image"
                                                                //  onClick={(e) => {e.stopPropagation(); setShowModal(true); setModalIndex(index);}}
                                                                onClick={(e) => {e.stopPropagation(); console.log(index); handleImageNav(tweet, index)}}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </Row>
                                                <Card.Subtitle className="text-muted">
                                                    Created at: {new Date(tweet.created_at).toLocaleString()}
                                                </Card.Subtitle>
                                            </Card.Body>
                                            <Row>
                                                <Button className="btn" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); handleOpenDialog(); }}>
                                                    <img src={comment} alt="Comment" width={"20px"} />
                                                    <span style={{ color: "black" }} className="ms-1">{tweet.comments}</span>
                                                </Button>
                                                <Button className="btn" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id, tweet.like_id) : handleLike(tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                                    <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                                    <span style={{ color: "black" }} className="ms-1">{tweet.likes}</span>
                                                </Button>
                                                <Button className="btn" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.isRetweeted ? handleUnretweet(tweet.id, tweet.retweet_id) : handleRetweet(tweet.id); }}>
                                                    <img src={tweet.isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                                    <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                                </Button>
                                            </Row>
                                        </div>
                                )}
                                    <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} />
                                    <DeleteDialog show={showDeleteDialog} handleClose={handleCloseDeleteDialog} handleDelete={handleDeleteTweet} />

                                    </Card>
                            ))
                        ) : (
                            <p>No tweets available.</p>
                        )}
                        </div>
                    )}
                    
                </Col>
            </Row>
        </Container>
    );
};
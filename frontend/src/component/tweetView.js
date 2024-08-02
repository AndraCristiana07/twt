import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Container, Row, Col, Dropdown } from "react-bootstrap";

import "../css/tweetView.css";
import back from "../assets/back-arrow.svg";
import heart from "../assets/heart.svg";
import heartred from "../assets/heart-red.svg";
import commentImg from "../assets/comment.svg";
import retweet from "../assets/retweet.svg";
import retweetred from "../assets/retweet-red.svg";
import axios from 'axios';
import { Comment } from "./commentPost";
import { CommentOnComment } from "./commentOnComment";
import Menu from "./drawer";
import { RetweetTweet } from './RetweetDialog';
import { Grid } from '@mui/material';


const TweetView = () => {
    const { tweetId } = useParams();
    const [tweet, setTweet] = useState(null);
    const [likes, setLikes] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [retweets, setRetweets] = useState([]);
    const [isRetweeted, setIsRetweeted] = useState(false);
    const [showPostCommentDialog, setShowPostCommentDialog] = useState(false);
    const [showPostCommentOnCommentDialog, setShowPostCommentOnCommentDialog] = useState(false);
    const [commentIdForDialog, setCommentIdForDialog] = useState(null);
    const [showQuoteDialog, setShowQuoteDialog] = React.useState(false);
    const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;

    const handleOpenQuoteDialog = (e) => {
        e.stopPropagation();
        setShowQuoteDialog(true);
    }
    const handleCloseQuoteDialog = () => {
        setShowQuoteDialog(false);
    }
    const apiUrl = process.env.REACT_APP_API_URL;

    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
        } else {
            fetchTweetData(tweetId);
            fetchComments();
        }
    }, [tweetId]);

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
            setTweet(tweet);

            var images = [];
            for (const url of tweet.image_urls) {
                var img = await imageFetch(url);
                images.push(img);
            }
            setImages(images);





        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
            }
        }
    };

    const [commentsImages, setCommentsImages] = useState([])
    const fetchComments = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/tweets/get_comments_for_tweet/${tweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComments(response.data.comments);
            var commentsImages = [];
            for (const comment of response.data.comments) {
                console.log(comment);
                for (const url of comment.image_urls) {
                    var img = await imageFetch(url);
                    commentsImages.push(img);
                }
                console.log(commentsImages)
                setCommentsImages(commentsImages);
            }
            console.log(response.data.comments)
        } catch (error) {
            console.log(error);
        }
    };


    const handleOpenDialog = () => setShowPostCommentDialog(true);
    const handleCloseDialog = () => setShowPostCommentDialog(false);
    const handleOpenCommentDialog = (commentId) => {
        setCommentIdForDialog(commentId);
        setShowPostCommentOnCommentDialog(true);
    };
    const handleCloseCommentDialog = () => {
        setShowPostCommentOnCommentDialog(false);
        setCommentIdForDialog(null);
    };

    const handleLike = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/like/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setLikes(prevLikes => [...prevLikes, { id: response.data.like_id, user_id: localStorage.getItem('user_id') }]);
            setIsLiked(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCommentLike = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/like_comment/${commentId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComments(comments.map(comment =>
                comment.id === commentId ? { ...comment, likes: [...comment.likes, { id: response.data.like_id, user_id: localStorage.getItem('user_id') }] } : comment
            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlike = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const likeId = likes.find(like => like.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setLikes(prevLikes => prevLikes.filter(like => like.user_id !== localStorage.getItem('user_id')));
            setIsLiked(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlikeComment = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const likeId = comments.find(comment => comment.id === commentId).likes.find(like => like.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setComments(comments.map(comment =>
                comment.id === commentId ? { ...comment, likes: comment.likes.filter(like => like.user_id !== localStorage.getItem('user_id')) } : comment
            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleRetweet = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/retweet/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setRetweets(prevRetweets => [...prevRetweets, { id: response.data.retweet_id, user_id: localStorage.getItem('user_id') }]);
            setIsRetweeted(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleRetweetComment = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/retweet_comment/${commentId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComments(comments.map(comment =>
                comment.id === commentId ? { ...comment, retweets: [...comment.retweets, { id: response.data.retweet_id, user_id: localStorage.getItem('user_id') }] } : comment
            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnretweet = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const retweetId = retweets.find(retweet => retweet.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setRetweets(prevRetweets => prevRetweets.filter(retweet => retweet.user_id !== localStorage.getItem('user_id')));
            setIsRetweeted(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnretweetComment = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const retweetId = comments.find(comment => comment.id === commentId).retweets.find(retweet => retweet.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setComments(comments.map(comment =>
                comment.id === commentId ? { ...comment, retweets: comment.retweets.filter(retweet => retweet.user_id !== localStorage.getItem('user_id')) } : comment
            ));
        } catch (error) {
            console.log(error);
        }
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



    if (!tweet) return <div>Loading...</div>;

    return (
        <Container fluid style={{ position: "relative" }}>
            <Row>
                <Col xs={2} style={{ position: "fixed", height: "100vh", overflow: "auto", borderRight: "1px solid black" }}>
                    <Menu />
                </Col>
                <Col xs={{ span: 9, offset: 2 }}>
                    <Button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none" }} className="btn mt-3">
                        <img src={back} alt="Back" width={"20px"} />
                    </Button>
                    <Card key={tweet.id} className="mb-4 tweet-card">
                        {tweet.retweet_id !== null && (
                            <Card.Body>
                                <Container fluid>
                                    <Row>
                                        <Col xs={10}>
                                            <img src={retweet} alt='Retweet' style={{ width: "2vw" }} />
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
                                                {tweet.original_tweet.image_urls && tweet.original_tweet.image_urls.map((image, index) => (
                                                    <Grid key={index}>
                                                        <img key={index} src={images[index]} alt="tweet image" style={{ maxWidth: '100%', margin: '10px 0', width: '30vw' }} />
                                                    </Grid>
                                                ))}
                                            </Row>

                                            <Row>
                                                <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                                                    <img src={commentImg} alt="Comment" width={"20px"} />
                                                    <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.comments}</span>
                                                </Button>
                                                <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.original_tweet.id} />

                                                <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.original_tweet.isLiked ? handleUnlike(tweet.original_tweet.id, tweet.original_tweet.like_id) : handleLike(tweet.original_tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                                    <img src={tweet.original_tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                                    <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.likes}</span>
                                                </Button>
                                                {tweet.original_tweet.isRetweeted ? (
                                                    <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); handleUnretweet(tweet.original_tweet.id, tweet.id) }}>
                                                        <img src={retweetred} alt="Retweet" width={"20px"} />
                                                        <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.retweets}</span>
                                                    </Button>

                                                ) :
                                                    (
                                                        <div>

                                                            <Dropdown onClick={(e) => { e.stopPropagation(); }} id="dropdown-basic-button" className="but" style={{ background: "transparent", border: "none", width: "80px" }}>
                                                                <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }}>
                                                                    <img src={retweet} alt="Retweet" width={"20px"} />
                                                                    <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.retweets}</span>
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); handleRetweet(tweet.original_tweet.id); }}>Retweet</Dropdown.Item>
                                                                    <Dropdown.Item onClick={(e) => { handleOpenQuoteDialog(e); }}>Quote Retweet</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={tweet.original_tweet.id} />
                                                        </div>

                                                    )}

                                            </Row>

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
                                                {tweet.content && (
                                                    <Row>
                                                        <Card.Text>
                                                            {tweet.original_tweet.content}
                                                        </Card.Text>
                                                    </Row>
                                                )}
                                                <Row>
                                                    {tweet.image_urls && tweet.image_urls.map((image, index) => (
                                                        <Grid key={index} >
                                                            <img key={index} src={images[index]} alt="tweet image" style={{ maxWidth: '100%', margin: '10px 0', width: '30vw' }} />

                                                        </Grid>
                                                    ))}
                                                </Row>
                                                <Row>
                                                    <Card.Subtitle className="text-muted">
                                                        Created at: {new Date(tweet.created_at).toLocaleString()}
                                                    </Card.Subtitle>
                                                </Row>

                                            </Card>
                                            <Row>
                                                <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                                                    <img src={commentImg} alt="Comment" width={"20px"} />
                                                    <span style={{ color: "black" }} className="ms-1">{tweet.comments}</span>
                                                </Button>
                                                <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} />
                                                <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id, tweet.like_id) : handleLike(tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                                    <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                                    <span style={{ color: "black" }} className="ms-1">{tweet.likes}</span>
                                                </Button>
                                                {tweet.isRetweeted ? (
                                                    <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); handleUnretweet(tweet.original_tweet.id, tweet.id) }}>
                                                        <img src={retweetred} alt="Retweet" width={"20px"} />
                                                        <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                                    </Button>

                                                ) :
                                                    (
                                                        <div>

                                                            <Dropdown onClick={(e) => { e.stopPropagation(); }} id="dropdown-basic-button" className="but" style={{ background: "transparent", border: "none", width: "80px" }}>
                                                                <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }}>
                                                                    <img src={retweet} alt="Retweet" width={"20px"} />
                                                                    <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); handleRetweet(tweet.id); }}>Retweet</Dropdown.Item>
                                                                    <Dropdown.Item onClick={(e) => { handleOpenQuoteDialog(e); }}>Quote Retweet</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={tweet.id} />
                                                        </div>

                                                    )}

                                            </Row>

                                        </div>

                                    )}
                                </Container>
                            </Card.Body>

                        )}
                        {/* tweet */}
                        {tweet.retweet_id === null && (
                            <Card.Body>
                                <Container fluid>
                                    <Row>
                                        <Col xs={6}>
                                            <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`) }}>
                                                {tweet.user_id} @{tweet.username}
                                            </Card.Title>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Card.Text>
                                            {tweet.content}
                                        </Card.Text>
                                    </Row>
                                    <Row>
                                        {tweet.image_urls && tweet.image_urls.map((image, index) => (
                                            <Grid key={index} >
                                                <img key={index} src={images[index]} alt="tweet image" style={{ maxWidth: '100%', margin: '10px 0', width: '30vw' }} />
                                            </Grid>
                                        ))}
                                    </Row>
                                    <Row>
                                        <Card.Subtitle className="text-muted">
                                            Created at: {new Date(tweet.created_at).toLocaleString()}
                                        </Card.Subtitle>
                                    </Row>
                                    <Row>
                                        <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                                            <img src={commentImg} alt="Comment" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{tweet.comments}</span>
                                        </Button>
                                        <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} />
                                        <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id, tweet.like_id) : handleLike(tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                            <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{tweet.likes}</span>
                                        </Button>
                                        {tweet.isRetweeted ? (
                                            <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); handleUnretweet(tweet.id, tweet.delete_retweet_id) }}>
                                                <img src={retweetred} alt="Retweet" width={"20px"} />
                                                <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                            </Button>
                                        ) :
                                            (
                                                <div>

                                                    <Dropdown onClick={(e) => { e.stopPropagation(); }} id="dropdown-basic-button" className="but" style={{ background: "transparent", border: "none", width: "80px" }}>
                                                        <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }}>
                                                            <img src={retweet} alt="Retweet" width={"20px"} />
                                                            <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={(e) => { e.stopPropagation(); handleRetweet(tweet.id); }}>Retweet</Dropdown.Item>
                                                            <Dropdown.Item onClick={(e) => { handleOpenQuoteDialog(e); }}>Quote Retweet</Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                    <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={tweet.id} />
                                                </div>

                                            )}

                                    </Row>
                                </Container>
                            </Card.Body>
                        )}

                    </Card>




                    <h5>Comments</h5>
                    {Array.isArray(comments) && comments.length > 0 ? (
                        comments.map(comment => (
                            <Card key={comment.id} className="mb-3 comment-card" onClick={() => navigate(`/tweet/comment/${comment.id}`)}>
                                <Card.Body>
                                    <Card.Title>{comment.user_id}</Card.Title>
                                    <Card.Text>{comment.content}</Card.Text>
                                    <Row>
                                        {comment.image_urls && comment.image_urls.map((commentImages, index) => (
                                            <Grid key={index} >
                                                <img key={index} src={commentsImages[index]} alt="comment image" style={{ maxWidth: '100%', margin: '10px 0', width: '30vw' }} />

                                            </Grid>
                                        ))}
                                    </Row>
                                    <Card.Subtitle className="text-muted">
                                        Created at: {new Date(comment.created_at).toLocaleString()}
                                    </Card.Subtitle>
                                    <Row>
                                        <Button className="btn" style={{ background: "transparent", border: "none", width: "60px" }} onClick={(e) => { e.stopPropagation(); handleOpenCommentDialog(comment.id); }}>
                                            <img src={commentImg} alt="Comment" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{comment.comments}</span>
                                        </Button>
                                        <Button className="btn" onClick={(e) => { e.stopPropagation(); comment.likes.some(like => like.user_id === localStorage.getItem('user_id')) ? handleUnlikeComment(comment.id) : handleCommentLike(comment.id); }} style={{ background: "transparent", border: "none", width: "60px" }}>
                                            <img src={comment.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{comment.likes}</span>
                                        </Button>
                                        <Button className="btn" style={{ background: "transparent", border: "none", width: "60px" }} onClick={(e) => { e.stopPropagation(); comment.retweets.some(retweet => retweet.user_id === localStorage.getItem('user_id')) ? handleUnretweetComment(comment.id) : handleRetweetComment(comment.id); }}>
                                            <img src={comment.isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{comment.retweets}</span>
                                        </Button>

                                    </Row>
                                    <CommentOnComment show={showPostCommentOnCommentDialog && commentIdForDialog === comment.id} handleClose={handleCloseCommentDialog} commentId={comment.id} />
                                </Card.Body>
                            </Card>
                        ))
                    ) : (
                        <p>No comments available.</p>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default TweetView;

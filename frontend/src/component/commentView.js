import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col, Dropdown } from "react-bootstrap";
import "../css/tweetView.css";
import back from "../assets/back-arrow.svg";
import heart from "../assets/heart.svg";
import heartred from "../assets/heart-red.svg";
import commentImg from "../assets/comment.svg";
import retweet from "../assets/retweet.svg";
import retweetred from "../assets/retweet-red.svg"
import { Comment } from "./modals/commentPost";
import { CommentOnComment } from "./modals/commentOnComment";
import { RetweetTweet } from './modals/RetweetDialog';
import axiosInstance from "../interceptor/axiosInstance";

import Menu from "./drawer";
import { CommentButtons } from "./commentButtons";

const CommentView = () => {
    const { commentId } = useParams();
    const [comment, setComment] = useState({});
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

    const handleOpenCommentDialog = (id) => {
        setShowPostCommentOnCommentDialog(true);
        setCommentIdForDialog(id);
    }

    const handleCloseCommentDialog = () => {
        setShowPostCommentOnCommentDialog(false);
        setCommentIdForDialog(null);
    }

    const apiUrl = process.env.REACT_APP_API_URL;

    const handleOpenDialog = () => {
        setShowPostCommentDialog(true);
    }

    const handleCloseDialog = () => {
        setShowPostCommentDialog(false);
    }

    const navigate = useNavigate();
    useEffect(() => {
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
        } else {
            fetchCommentData(commentId);
            fetchCommentComments();
        }
    }, [commentId]);
    const [images, setImages] = useState([]);

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
        const response = await axiosInstance.get(url, config);
        return URL.createObjectURL(response.data)
    }
    
    const fetchCommentData = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/tweets/tweet_comment/${commentId}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            const data = response.data;
            setComment(data);
            var images = [];
            for (const url of data.image_urls) {
                var img = await imageFetch(url);
                images.push(img);
            }
            setImages(images);
            
        } catch (error) {
            console.error(error);
        }
    };

    const [commentsImages, setCommentsImages] = useState([])
    const fetchCommentComments = async () => {
       
       try { 
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/tweets/get_comments_for_comment/${commentId}`, {
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
        } catch (error) {
            console.error(error);
        }
    }

    const handleLike = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/like_comment/${comment.id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComment(tweet => ({ ...tweet, isLiked: true, likes: tweet.likes + 1 }))

        } catch (error) {
            console.error(error);
        }
    };

    const handleRetweet = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/retweet_comment/${comment.id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComment(tweet => ({ ...tweet, isRetweeted: true, retweets: tweet.retweets + 1 }))

        } catch (error) {
            console.error(error);
        }
    };

    

    const handleUnlike = async (commentId, likeId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setComment(tweet => ({ ...tweet, isLiked: false, likes: tweet.likes - 1 }))

        } catch (error) {
            console.error(error);
        }
    };

    const handleUnretweet = async (commentId, retweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setComment(tweet => ({ ...tweet, isRetweeted: false, retweets: tweet.retweets - 1 }))

        } catch (error) {
            console.error(error);
        }
    };

    const handleUnretweetComment = async (commentId, retweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setComments(prevTweets => prevTweets.map(comment => comment.id === commentId ? { ...comment, isRetweeted: false, retweets: comment.retweets - 1 } : comment));

        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlikeComment = async (commentId, likeId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setComments(prevTweets => prevTweets.map(comment => comment.id === commentId ? { ...comment, isLiked: false, likes: comment.likes - 1 } : comment));

        } catch (error) {
            console.log(error);
        }
    };


    const handleRetweetComment = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/retweet_comment/${commentId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComments(prevTweets => prevTweets.map(comment => comment.id === commentId ? { ...comment, isRetweeted: true, retweets: comment.retweets + 1 } : comment));

        } catch (error) {
            console.log(error);
        }
    };

    const handleCommentLike = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/like_comment/${commentId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComments(prevTweets => prevTweets.map(comment => comment.id === commentId ? { ...comment, isLiked: true, likes: comment.likes + 1 } : comment));

        } catch (error) {
            console.log(error);
        }
    };

    const handleImageNav = (tweet, index) => {

        navigate(`/tweet/${tweet.id}/images/${index}`);
    }

    const tweetheader = (tweet) => {
        return (
            <><Row>

                <Col xs={6}>
                    <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`); } }>
                        {tweet.user_id} @{tweet.username}
                    </Card.Title>
                </Col>
            </Row><Row>
                    <Card.Text>
                        {tweet.content}
                    </Card.Text>
                </Row></>
        )
        
    }

    const tweetImages = (tweet) => {
        return (
            <Row>
                {tweet.image_urls && (
                    <div className="image-grid" data-count={tweet.image_urls.length}>
                        {tweet.image_urls.map((image, index) => (
                            <img key={index} src={images[index]} alt="tweet image" className="grid-image"
                                onClick={(e) => { e.stopPropagation(); console.log(`selected image ${index}`); handleImageNav(tweet, index) }}
                            />
                        ))}
                    </div>
                )}
            </Row>
        )
    }

    const tweetButtons = (tweet, originalTweet) => {
        return (
            <Row>
            <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                <img src={commentImg} alt="Comment" width={"20px"} />
                <span style={{ color: "black" }} className="ms-1">{tweet.comments}</span>
            </Button>
            <CommentOnComment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} />
            <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id, tweet.like_id) : handleLike(tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                <span style={{ color: "black" }} className="ms-1">{tweet.likes}</span>
            </Button>
            {tweet.isRetweeted ? (
                <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); handleUnretweet(tweet.id, tweet.retweeted_id) }}>
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
        )
    }


    if (!comment) return <div>Loading...</div>;
    
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
                    <Card key={comment.id} className="mb-4 tweet-card">
                        {comment.retweet_id !== null && (
                            <Card.Body>
                                <Container fluid>
                                    <Row>
                                        <Col xs={10}>
                                            <img src={retweet} alt='Retweet' style={{ width: "2vw" }} />
                                            <p>{comment.username} has retweeted</p>
                                        </Col>
                                    </Row>
                                    {(!comment.content && !comment.image_urls) && (
                                        <Container fluid>
                                            {tweetheader(comment.original_tweet)}
                                            {tweetImages(comment.original_tweet)}
                                            {/* {tweetButtons(comment.original_tweet, comment)} */}
                                            <CommentButtons comment={comment} handleCommentLike={handleLike} handleUnlikeComment={handleUnlike} handleRetweetComment={handleRetweet} handleUnretweetComment={handleUnretweet} />

                                        </Container>
                                    )}
                                    {(comment.content !== "" || comment.image_urls) && (
                                        <div>
                                            <Row>
                                                <Col> {comment.content}
                                                </Col>
                                            </Row>
                                            <Card>
                                                {tweetheader(comment)}
                                                {tweetImages(comment)}
                                                {tweetButtons(comment, comment.original_tweet)}
                                                <Row>
                                                    <Card.Subtitle className="text-muted">
                                                        Created at: {new Date(comment.created_at).toLocaleString()}
                                                    </Card.Subtitle>
                                                </Row>

                                            </Card>
                                        </div>
                                    )}
                                </Container>
                            </Card.Body>
                        )}
                        {comment.retweet_id === null && (
                            <Card.Body>
                                <Container fluid>
                                    {tweetheader(comment)} {console.log("tweet user: " + comment)}
                                    {tweetImages(comment)}
                                    
                                    <Row>
                                        <Card.Subtitle className="text-muted">
                                            Created at: {new Date(comment.created_at).toLocaleString()}
                                        </Card.Subtitle>
                                    </Row>
                                    {tweetButtons(comment, comment.original_tweet)}
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
                                    <Card.Subtitle className="text-muted">
                                        Created at: {new Date(comment.created_at).toLocaleString()}
                                    </Card.Subtitle>
                                    <Row>
                                        <Button className="btn" style={{ background: "transparent", border: "none", width: "60px" }} onClick={(e) => { e.stopPropagation(); handleOpenCommentDialog(comment.id); }}>
                                            <img src={commentImg} alt="Comment" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{comment.comments}</span>
                                        </Button>
                                        <Button className="btn" onClick={(e) => { e.stopPropagation(); comment.isCommentLiked ? handleUnlikeComment(comment.id) : handleCommentLike(comment.id); }} style={{ background: "transparent", border: "none", width: "60px" }}>
                                            <img src={comment.isCommentLiked ? heartred : heart} alt="Like" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{comment.likes}</span>
                                        </Button>
                                        <Button className="btn" style={{ background: "transparent", border: "none", width: "60px" }} onClick={(e) => { e.stopPropagation(); comment.isCommentRetweeted ? handleUnretweetComment(comment.id) : handleRetweetComment(comment.id); }}>
                                            <img src={comment.isCommentRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{comment.retweets}</span>
                                        </Button>
                                       
                                    </Row>
                                    <CommentOnComment show={showPostCommentOnCommentDialog && commentIdForDialog === comment.id} handleClose={handleCloseCommentDialog} commentId={comment.id} />
                                </Card.Body>
                            </Card>
                        ))
                    ) : (
                        <p>No comments yet.</p>
                    )}
                </Col>
            </Row>
        </Container>
    )
}
export default CommentView    
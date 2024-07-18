import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import "../css/tweetView.css";
import back from "../assets/back-arrow.svg";
import heart from "../assets/heart.svg";
import heartred from "../assets/heart-red.svg";
import commentImg from "../assets/comment.svg";
import retweet from "../assets/retweet.svg";
import retweetred from "../assets/retweet-red.svg"
import bookmark from "../assets/bookmark.svg";
import bookmarkedblue from "../assets/bookmark-color.svg"
import axios from 'axios';
import { CommentOnComment } from "./commentOnComment";
import Menu from "./drawer";

const CommentView = () => {
    const { commentId } = useParams();
    const [comment, setComment] = useState({});
    const [likes, setLikes] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [retweets, setRetweets] = useState([]);
    const [isRetweeted, setIsRetweeted] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showPostCommentDialog, setShowPostCommentDialog] = useState(false);
    const [showPostCommentOnCommentDialog, setShowPostCommentOnCommentDialog] = useState(false);
    const [commentIdForDialog, setCommentIdForDialog] = useState(null);

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
        }
    }, [commentId]);

    const fetchCommentData = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/tweets/tweet_comment/${commentId}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            const data = response.data;
            setComment(data);
            if (data.comments) {
                const sortedComments = data.comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setComments(sortedComments.map(comm => ({
                    ...comm,
                    likes: comm.likes || [],
                    retweets: comm.retweets || [],
                    comments: comm.comments || [],
                    bookmarks: comm.bookmarks || [],
                })));
            }
            setLikes(data.likes || []);
            setRetweets(data.retweets || []);
            setBookmarks(data.bookmarks || []);
            setIsLiked(data.likes.some(like => like.user_id === localStorage.getItem('user_id')));
            setIsRetweeted(data.retweets.some(retweet => retweet.user_id === localStorage.getItem('user_id')));
            setIsBookmarked(data.bookmarks.some(bookmark => bookmark.user_id === localStorage.getItem('user_id')));
        } catch (error) {
            console.error(error);
        }
    };

    const handleLike = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/like_comment/${comment.id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setLikes(prevLikes => [...prevLikes, { id: response.data.like_id, user_id: localStorage.getItem('user_id') }]);
            setIsLiked(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRetweet = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/retweet_comment/${comment.id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setRetweets(prevRetweets => [...prevRetweets, { id: response.data.retweet_id, user_id: localStorage.getItem('user_id') }]);
            setIsRetweeted(true);
        } catch (error) {
            console.error(error);
        }
    };

    // const handleBookmark = async () => {
    //     try {
    //         const accessToken = localStorage.getItem('access_token');
    //         const response = await axios.post(`${apiUrl}/tweets/bookmark/${comment.id}`, {}, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${accessToken}`
    //             },
    //             withCredentials: true
    //         });
    //         setBookmarks(prevBookmarks => [...prevBookmarks, { id: response.data.bookmark_id, user_id: localStorage.getItem('user_id') }]);
    //         setIsBookmarked(true);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

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
                data: { comment_id: commentId }
            });
            setLikes(prevLikes => prevLikes.filter(like => like.user_id !== localStorage.getItem('user_id')));
            setIsLiked(false);
        } catch (error) {
            console.error(error);
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
                data: { comment_id: commentId }
            });
            setRetweets(prevRetweets => prevRetweets.filter(retweet => retweet.user_id !== localStorage.getItem('user_id')));
            setIsRetweeted(false);
        } catch (error) {
            console.error(error);
        }
    };

    // const handleRemoveBookmark = async () => {
    //     try {
    //         const accessToken = localStorage.getItem('access_token');
    //         const bookmarkId = bookmarks.find(bookmark => bookmark.user_id === localStorage.getItem('user_id')).id;
    //         await axios.delete(`${apiUrl}/tweets/delete_bookmark/${bookmarkId}`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${accessToken}`
    //             },
    //             withCredentials: true,
    //             data: { comment_id: commentId }
    //         });
    //         setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.user_id !== localStorage.getItem('user_id')));
    //         setIsBookmarked(false);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    const handleBookmark = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/bookmark/${comment.id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setBookmarks(prevBookmarks => [...prevBookmarks, { id: response.data.bookmark_id, user_id: localStorage.getItem('user_id') }]);
            setIsBookmarked(true);
        } catch (error) {
            console.error(error);
        }
    };
    
    const handleRemoveBookmark = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const bookmarkId = bookmarks.find(bookmark => bookmark.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/delete_bookmark/${bookmarkId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.user_id !== localStorage.getItem('user_id')));
            setIsBookmarked(false);
        } catch (error) {
            console.error(error);
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
                comment.id === commentId ? { ...comment, retweets: comment.retweets.filter(retweet => retweet.user_id !== localStorage.getItem('user_id')), isCommentRetweeted: false } : comment
            ));
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
                comment.id === commentId ? { ...comment, likes: comment.likes.filter(like => like.user_id !== localStorage.getItem('user_id')), isCommentLiked: false } : comment
            ));
        } catch (error) {
            console.log(error);
        }
    };

   const handleRemoveBookmarkComment = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const bookmarkId = comments.find(comment => comment.id === commentId).bookmarks.find(bookmark => bookmark.user_id === localStorage.getItem('user_id')).id;
            await axios.delete(`${apiUrl}/tweets/delete_bookmark/${bookmarkId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setComments(comments.map(comment =>
                comment.id === commentId ? { ...comment, bookmarks: comment.bookmarks.filter(bookmark => bookmark.user_id !== localStorage.getItem('user_id')), isCommentBookmarked: false } : comment
            ));
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
                comment.id === commentId ? { ...comment, retweets: [...comment.retweets, { id: response.data.retweet_id, user_id: localStorage.getItem('user_id') }], isCommentRetweeted: true } : comment
            ));
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
                comment.id === commentId ? { ...comment, likes: [...comment.likes, { id: response.data.like_id, user_id: localStorage.getItem('user_id') }], isCommentLiked: true } : comment
            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleCommentBookmark = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/bookmark/${commentId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComments(comments.map(comment =>
                comment.id === commentId ? { ...comment, bookmarks: [...comment.bookmarks, { id: response.data.bookmark_id, user_id: localStorage.getItem('user_id') }], isCommentBookmarked: true } : comment
            ));
        } catch (error) {
            console.log(error);
        }
    }

    const countLikes = () => {
        return likes.length;
    };

    const countRetweets = () => {
        return retweets.length;
    };

    const countComments = () => {
        return comments.length;
    };

    const countBookmarks = () => {
        return bookmarks.length;
    }
    
    const countCommentLikes = (comment) => comment.likes ? comment.likes.length : 0;
    const countCommentRetweets = (comment) => comment.retweets ? comment.retweets.length : 0;
    const countCommentComments = (comment) => comment.comments ? comment.comments.length : 0;
    const countCommentBookmarks = (comment) => comment.bookmarks ? comment.bookmarks.length : 0;

    if (!comment) return <div>Loading...</div>;
    
    return (
        <Container fluid  style={{position:"relative"}}>
            <Row>
                <Col xs={2} style={{position:"fixed", height:"100vh", overflow:"auto"}}>
                    <Menu />
                </Col>
                <Col xs={{span:9, offset:2}}>
                    <Button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none" }} className="btn mt-3" >
                        <img src={back} alt="Back" width={"20px"} />
                    </Button>
                    <Card className="mt-3">
                        <Card.Body>
                            <Card.Title>{comment.user_id}</Card.Title>
                            <Card.Text>{comment.content}</Card.Text>
                            <Row>
                                <Button className="btn" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                                    <img src={commentImg} alt="Comment" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{countComments()}</span>
                                </Button>
                                <Button className="btn" onClick={isLiked ? handleUnlike : handleLike} style={{ background: "transparent", border: "none", width: "80px" }}>
                                    <img src={isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{countLikes()}</span>
                                </Button>
                                <Button className="btn" style={{ background: "transparent", border: "none", width: "80px" }} onClick={isRetweeted ? handleUnretweet : handleRetweet}>
                                    <img src={isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{countRetweets()}</span>
                                </Button>
                                <Button className="btn" style={{ background: "transparent", border: "none", width: "80px" }} onClick={isBookmarked ? handleRemoveBookmark : handleBookmark}>
                                    <img src={isBookmarked ? bookmarkedblue : bookmark} alt="Bookmark" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{countBookmarks()}</span>
                                </Button>
                            </Row>
                            <CommentOnComment show={showPostCommentDialog} handleClose={handleCloseDialog} commentId={commentId} />
                        </Card.Body>
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
                                            <span style={{ color: "black" }} className="ms-1">{countCommentComments(comment)}</span>
                                        </Button>
                                        <Button className="btn" onClick={(e) => { e.stopPropagation(); comment.isCommentLiked ? handleUnlikeComment(comment.id) : handleCommentLike(comment.id); }} style={{ background: "transparent", border: "none", width: "60px" }}>
                                            <img src={comment.isCommentLiked ? heartred : heart} alt="Like" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{countCommentLikes(comment)}</span>
                                        </Button>
                                        <Button className="btn" style={{ background: "transparent", border: "none", width: "60px" }} onClick={(e) => { e.stopPropagation(); comment.isCommentRetweeted ? handleUnretweetComment(comment.id) : handleRetweetComment(comment.id); }}>
                                            <img src={comment.isCommentRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{countCommentRetweets(comment)}</span>
                                        </Button>
                                        <Button className="btn" style={{ background: "transparent", border: "none", width: "60px" }} onClick={(e) => { e.stopPropagation(); comment.isCommentBookmarked ? handleRemoveBookmarkComment(comment.id) : handleCommentBookmark(comment.id); }}>
                                            <img src={comment.isCommentBookmarked ? bookmarkedblue : bookmark} alt="Bookmark" width={"20px"} />
                                            <span style={{ color: "black" }} className="ms-1">{countCommentBookmarks(comment)}</span>
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
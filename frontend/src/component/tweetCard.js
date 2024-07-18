import React from 'react';
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import heart from "../assets/heart.svg";
import heartred from "../assets/heart-red.svg";
import comment from "../assets/comment.svg";
import retweet from "../assets/retweet.svg";
import retweetred from "../assets/retweet-red.svg";
import bookmark from "../assets/bookmark.svg";
import bookmarkedblue from "../assets/bookmark-color.svg"
import { Comment } from "./commentPost";
import "../css/tweetCard.css";

export const TweetCard = ({ tweet, handleLike, handleUnlike, handleRetweet, handleUnretweet, handleBookmark, handleRemoveBookmark }) => {
    const navigate = useNavigate();
    const [showPostCommentDialog, setShowPostCommentDialog] = React.useState(false);

    const handleOpenDialog = (e) => {
        e.stopPropagation();
        setShowPostCommentDialog(true);
    };

    const handleCloseDialog = () => {
        setShowPostCommentDialog(false);
    };

    const countLikes = (tweet) => tweet.likes ? tweet.likes.length : 0;
    const countRetweets = (tweet) => tweet.retweets ? tweet.retweets.length : 0;
    const countComments = (tweet) => tweet.comments ? tweet.comments.length : 0;
    const countBookmarks = (tweet) => tweet.bookmarks ? tweet.bookmarks.length : 0;

    return (
        <Card key={tweet.id} className="mb-4 tweet-card" onClick={() => { navigate(`/tweet/${tweet.id}`) }}>
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
                        <Card.Subtitle className="text-muted">
                            Created at: {new Date(tweet.created_at).toLocaleString()}
                        </Card.Subtitle>
                    </Row>
                    <Row>
                        <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                            <img src={comment} alt="Comment" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{countComments(tweet)}</span>
                        </Button>
                        <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id) : handleLike(tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                            <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{countLikes(tweet)}</span>
                        </Button>
                        <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.isRetweeted ? handleUnretweet(tweet.id) : handleRetweet(tweet.id); }}>
                            <img src={tweet.isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{countRetweets(tweet)}</span>
                        </Button>
                        {/* <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.isBookmarked ? handleRemoveBookmark(tweet.id) : handleBookmark(tweet.id); }}>
                            <img src={tweet.isBookmarked ? bookmarkedblue : bookmark} alt="Bookmark" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{countBookmarks(tweet)}</span>
                        </Button> */}
                    </Row>
                    <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} />
                </Container>
            </Card.Body>
        </Card>
    );
};

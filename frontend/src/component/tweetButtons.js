import { Button, Dropdown, Row, Col } from "react-bootstrap";
import { Comment } from "./modals/commentPost";
import { CommentOnComment } from "./modals/commentOnComment";
import { RetweetTweet } from "./modals/RetweetDialog";
import { useState, useEffect } from "react";
import heart from "../assets/heart.svg";
import heartred from "../assets/heart-red.svg";
import commentImg from "../assets/comment.svg";
import retweet from "../assets/retweet.svg";
import retweetred from "../assets/retweet-red.svg";

export const TweetButtons = ({tweet, handleLike, handleUnlike, handleRetweet, handleUnretweet,}) => {

    const [showQuoteDialog, setShowQuoteDialog] = useState(false);
    const [showPostCommentDialog, setShowPostCommentDialog] = useState(false);

    const handleOpenDialog = (e) => {
        setShowPostCommentDialog(true);
    };

    const handleCloseDialog = () => {
        setShowPostCommentDialog(false);
    };

    const handleOpenQuoteDialog = (e) => {
        setShowQuoteDialog(true);

    }
    const handleCloseQuoteDialog = () => {
        setShowQuoteDialog(false);
    }

    return (
        <Row onClick={(e)=>e.stopPropagation()}>
        <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={tweet.id} />

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

            )}

    </Row>
    )
}
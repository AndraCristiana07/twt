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
import axiosInstance from "../interceptor/axiosInstance";


export const CommentButtons = ({comment, handleCommentLike, handleUnlikeComment, handleRetweetComment, handleUnretweetComment,}) => {

    const [showQuoteDialog, setShowQuoteDialog] = useState(false);
    const [showPostCommentDialog, setShowPostCommentDialog] = useState(false);
    const [commentIdForDialog, setCommentIdForDialog] = useState(null);
    const [showPostCommentOnCommentDialog, setShowPostCommentOnCommentDialog] = useState(false);

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
    const handleOpenDialog = () => {
        setShowPostCommentDialog(true);
    }

    const handleCloseDialog = () => {
        setShowPostCommentDialog(false);
    }
    return (
        <Row>
            <Button className="btn" style={{ background: "transparent", border: "none", width: "60px" }} onClick={(e) => { e.stopPropagation(); handleOpenCommentDialog(comment.id); }}>
                <img src={commentImg} alt="Comment" width={"20px"} />
                <span style={{ color: "black" }} className="ms-1">{comment.comments}</span>
            </Button>
            <Button className="but" onClick={(e) => { e.stopPropagation(); comment.isLiked ? handleUnlikeComment(comment.id, comment.like_id) : handleCommentLike(comment.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                <img src={comment.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                <span style={{ color: "black" }} className="ms-1">{comment.likes}</span>
            </Button>
            <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={comment.id} />
            <CommentOnComment show={showPostCommentOnCommentDialog && commentIdForDialog === comment.id} handleClose={handleCloseCommentDialog} commentId={comment.id} />
            
            {comment.isRetweeted ? (
                <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); handleUnretweetComment(comment.id, comment.delete_retweet_id) }}>
                    <img src={retweetred} alt="Retweet" width={"20px"} />
                    <span style={{ color: "black" }} className="ms-1">{comment.retweets}</span>
                </Button>
            ) :
                (
                    <Dropdown onClick={(e) => { e.stopPropagation(); }} id="dropdown-basic-button" className="but" style={{ background: "transparent", border: "none", width: "80px" }}>
                        <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }}>
                            <img src={retweet} alt="Retweet" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{comment.retweets}</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={(e) => { handleRetweetComment(comment.id); }}>Retweet</Dropdown.Item>
                            <Dropdown.Item onClick={(e) => { handleOpenQuoteDialog(e); }}>Quote Retweet</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                )}

        </Row>
    )
}
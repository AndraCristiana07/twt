import React, { useState } from 'react';
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import heart from "../assets/heart.svg";
import heartred from "../assets/heart-red.svg";
import retweet from "../assets/retweet.svg";
import retweetred from "../assets/retweet-red.svg";

export const CommentCard = ({ comment, tweetId }) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(comment.isLiked);
    const [isRetweeted, setIsRetweeted] = useState(comment.isRetweeted);
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleLike = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axios.post(`${apiUrl}/comments/like/${comment.id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setIsLiked(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlike = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axios.delete(`${apiUrl}/comments/unlike/${comment.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setIsLiked(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleRetweet = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axios.post(`${apiUrl}/comments/retweet/${comment.id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setIsRetweeted(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnretweet = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axios.delete(`${apiUrl}/comments/unretweet/${comment.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setIsRetweeted(false);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Card key={comment.id} className="mb-3 comment-card">
            <Card.Body>
                <Card.Title onClick={() => navigate(`/comment/${comment.id}`)}>{comment.user_id}</Card.Title>
                <Card.Text>{comment.content}</Card.Text>
                <Card.Subtitle className="text-muted">
                    Created at: {new Date(comment.created_at).toLocaleString()}
                </Card.Subtitle>
                <div>
                    <Button onClick={isLiked ? handleUnlike : handleLike}>
                        <img src={isLiked ? heartred : heart} alt="Like" width="20px" />
                    </Button>
                    <Button onClick={isRetweeted ? handleUnretweet : handleRetweet}>
                        <img src={isRetweeted ? retweetred : retweet} alt="Retweet" width="20px" />
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

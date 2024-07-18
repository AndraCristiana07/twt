import { useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import React from 'react';
import media from '../assets/media.svg'
export const Tweet = ({show, handleClose}) => {

    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null)

    // const handleTweetChange = (e) => {
    //     setTweet(e.target.value);
    // }

    // const handleTweetSubmit = (e) => {
    //     e.preventDefault();
    //     console.log(tweet);
    // }
    const apiUrl = process.env.REACT_APP_API_URL
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
            return;
        }

        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/post/`, {
                content: content
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            setContent("");
            setSuccess("Tweet posted successfully!");
            handleClose();
        } catch (error) {
            console.error(error);
            setError("Failed to post tweet.");
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
            }
        }
    };


    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Post a Tweet</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formTweetContent">
                        <Form.Label>Tweet</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </Form.Group>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green' }}>{success}</p>}
                    <img src={media} alt="media" title="media content" style={{width:"4vw", height:"4vh"}}/>
                    <Button variant="primary" type="submit">
                        Post Tweet
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    )
}
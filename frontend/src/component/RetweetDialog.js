import { useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import React from 'react';
import media from '../assets/media.svg'
export const RetweetTweet = ({show, handleClose, tweetId}) => {

    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null)
    const [files, setFiles] = useState([])
    const [previews, setPreviews] = useState([]);
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

        // const handleRetweet = async (tweetId) => {
            try {
                const accessToken = localStorage.getItem('access_token');
                const response = await axios.post(`${apiUrl}/tweets/retweet/${tweetId}`, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
                
                setSuccess("Retweet posted successfully!");
                // setTweets(tweets.map(tweet =>
                //     tweet.id === tweetId ? { ...tweet, retweets: tweet.retweets + 1, isRetweeted: true } : tweet
                // ));
            } catch (error) {
                console.log(error);
                setError("Failed to post quote retweet");
            }
        // };
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prevPreviews => [...prevPreviews, ...previewUrls]);
    }



    return (
        <Modal show={show} onHide={handleClose} onClick={(e) => e.stopPropagation()}>
            <Modal.Header closeButton>
                <Modal.Title>Post a Quote Retweet</Modal.Title>
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
                    <div style={{position:"relative", width: '4vw', height: '4vh' }}>
                        <input  
                        onChange={handleFileChange}
                        type="file" multiple  
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            zIndex: 2,
                            cursor: 'pointer'
                        }} />
                        <img src={media} alt="media" title="media content" 
                            style={{
                            width: '100%', 
                            height: '100%', 
                            position: 'absolute',
                            zIndex: 1
                        }} />

                    </div>
                    <Button variant="primary" type="submit">
                        Post Quote Retweet
                    </Button>
                </Form>
                <div>
                    {previews.map((preview, index) => (
                        <img key={index} src={preview} alt="preview" style={{ width: '100px', height: '100px', margin: '10px' }} />
                    ))}
                </div>
            </Modal.Body>
        </Modal>
    )
}
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
// import dotenv from 'dotenv';
// dotenv.config();
const apiUrl = process.env.REACT_APP_API_URL;

export const CommentOnComment = ({show, handleClose, commentId}) => {
    // const { commentId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmiit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if(localStorage.getItem('access_token') == null){
            window.location.href = "/login";
            return;

        }

        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/tweets/comment_on_comment/${commentId}`, {
                content: content
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setContent("");
            setSuccess("Comment posted successfully!");
            handleClose();
        } catch (error) {
            console.error(error);
            setError("Failed to post comment.");
        }

    }
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    return (
        <Modal show={show} onHide={handleClose} onClick={handleModalClick}>
            <Modal.Header closeButton>
                <Modal.Title>Post a Comment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmiit}>
                    <Form.Group controlId="content">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </Form.Group>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green' }}>{success}</p>}
                    <Button variant="primary" type="submit">
                        Post Comment
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    )
}
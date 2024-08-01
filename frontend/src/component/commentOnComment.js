import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import media from '../assets/media.svg'

const apiUrl = process.env.REACT_APP_API_URL;

export const CommentOnComment = ({show, handleClose, commentId}) => {
    // const { commentId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [files, setFiles] = useState([]);


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
            const formdata = new FormData();
            formdata.append('content', content)
            for(let i=0; i<files.length; i++){
                formdata.append(`images`, files[i]);
            }
            const response = await axios.post(`${apiUrl}/tweets/comment_on_comment/${commentId}`, {
                content: content
            }, {
                headers: {
                    "Content-Type": "multipart/form-data",
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
                    <div style={{position:"relative", width: '4vw', height: '4vh' }}>
                        <input  onChange={(e)=> {setFiles(e.target.files)}} type="file" multiple  
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
                        Post Comment
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    )
}
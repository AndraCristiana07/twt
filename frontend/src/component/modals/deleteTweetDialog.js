import { Modal, Button as BootstrapButton, Form } from "react-bootstrap";
import { useState } from "react";
import axiosInstance from "../../interceptor/axiosInstance";

export const DeleteDialog = ({ show, handleClose, tweetId }) => {
    const apiUrl = process.env.REACT_APP_API_URL;

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const handleModalClick = (e) => {
        e.stopPropagation();
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/delete/${tweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
            });
            handleClose();
        } catch (error) {
            console.log(error);
        }
    };
    
    return (
        <Modal show={show} onHide={handleClose} onClick={handleModalClick}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Tweet</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="content">
                            <Form.Label>Are you sure you want to delete this tweet?</Form.Label>
                        
                        </Form.Group>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {success && <p style={{ color: 'green' }}>{success}</p>}
                    <Modal.Footer>
                        <BootstrapButton variant="secondary" onClick={handleClose}>
                            Close
                        </BootstrapButton>
                        <BootstrapButton variant="danger" onClick={handleSubmit}>
                            Delete
                        </BootstrapButton>
                    </Modal.Footer>
                </Form>
            </Modal.Body>

        </Modal>
    );
};
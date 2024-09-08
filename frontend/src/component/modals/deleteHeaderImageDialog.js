import { Modal, Button as BootstrapButton, Form } from "react-bootstrap";
import { useState } from "react";
import axiosInstance from "../../interceptor/axiosInstance";

export const DeleteHeaderImageDialog = ({ show, handleClose }) => {
    const apiUrl = process.env.REACT_APP_API_URL;

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const handleModalClick = (e) => {
        e.stopPropagation();
    };
    const handleDeleteImage = async (e) => {
        setError(null);
        setSuccess(null);
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
            return;
        }
        try {
            const accessToken = localStorage.getItem('access_token');
        

            const response = await axiosInstance.delete(`${apiUrl}/delete_header_picture`,

                
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': `Bearer ${accessToken}`
                    },

                });
            setSuccess("Header image deleted successfully!");
            handleClose();

        } catch (error) {
            setError("Failed to delete header image.");
        }
    }
    
    return (
        <Modal show={show} onHide={handleClose} onClick={handleModalClick}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Header Image</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <Form onSubmit={handleDeleteImage}>
                        <Form.Group controlId="content">
                            <Form.Label>Are you sure you want to delete the header image?</Form.Label>
                            
                        </Form.Group>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {success && <p style={{ color: 'green' }}>{success}</p>}
                    <Modal.Footer>
                        <BootstrapButton variant="secondary" onClick={handleClose}>
                            Close
                        </BootstrapButton>
                        <BootstrapButton variant="danger" onClick={handleDeleteImage}>
                            Delete
                        </BootstrapButton>
                    </Modal.Footer>
                </Form>
            </Modal.Body>

        </Modal>
    );
};
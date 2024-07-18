import { Modal, Button as BootstrapButton } from "react-bootstrap";

export const DeleteDialog = ({ show, handleClose, handleDelete }) => {
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    return (
        <Modal show={show} onHide={handleClose} onClick={handleModalClick}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Tweet</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this tweet?</Modal.Body>
            <Modal.Footer>
                <BootstrapButton variant="secondary" onClick={handleClose}>
                    Close
                </BootstrapButton>
                <BootstrapButton variant="danger" onClick={handleDelete}>
                    Delete
                </BootstrapButton>
            </Modal.Footer>
        </Modal>
    );
};
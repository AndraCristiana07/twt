import { useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import close_icon from '../../assets/add.svg'
import camera from '../../assets/camera.svg'
import axiosInstance from "../../interceptor/axiosInstance";
import deleteImg from '../../assets/delete.svg'

import {Tooltip} from "@mui/material"; 
import { DeleteHeaderImageDialog } from "./deleteHeaderImageDialog";

export const ChangeHeaderPicture = ({show, handleClose}) => {
    const [headerImage, setHeaderImage] = useState(null);
    const [headerFile, setHeaderFile] = useState(null);
    const [headerPreview, setHeaderPreview] = useState();
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL
    const [showHeaderDialog, setShowHeaderDialog] = useState(false)

    const handleOpenHeaderialog = () => {
        setShowHeaderDialog(true);
    };

    const handleCloseHeaderDialog = () => {
        setShowHeaderDialog(false);
    };

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
            const formdata = new FormData();
            formdata.append('headerImage', headerImage);

            await axiosInstance.post(`${apiUrl}/upload_header_picture`,
                formdata,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': `Bearer ${accessToken}`
                    },

                });
            setSuccess("header image uploaded successfully!");
            handleClose();

        } catch (error) {
            setError("Failed to upload header image.");
        }
    }

    const handleHeaderFileChange = (e) => {
        const file = e.target.files[0];
        console.log("aaaaaaaaaaaaaa" + file)

        if(file){
            setHeaderImage(file);
            setHeaderPreview(URL.createObjectURL(file));
        }

    }
    const removeHeaderImage = () => {
        setHeaderImage(null);
        setHeaderPreview(null);
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title> Edit header Image</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form onSubmit={handleSubmit}> 

            <Tooltip title="Media header" style={{margin:"50px"}}>
                <div style={{position:"relative", width: '4vw', height: '4vh' }}>
                    <input
                        onChange={handleHeaderFileChange}
                        type="file" multiple
                        title=""
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            zIndex: 2,
                            cursor: 'pointer'
                        }} />
                    <img src={camera} alt="header" title="media content"
                        style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        zIndex: 1
                    }} />
                </div>
                </Tooltip>
                <Tooltip title="Delete image" onClick={handleOpenHeaderialog}>
                        <img style={{width:"5vw"}} src={deleteImg} />
                    </Tooltip>
                    <DeleteHeaderImageDialog show={showHeaderDialog} handleClose={handleCloseHeaderDialog} />


                <div>
                    {headerPreview && (
                        <div
                            style={{ display: "inline-block" }}
                            onMouseOver={event => { document.getElementById('close-icon').style.opacity = 100 }}
                            onMouseOut={event => { document.getElementById('close-icon').style.opacity = 0 }}>
                            <img id="close-icon" src={close_icon} onClick={removeHeaderImage}
                                style={{ transform: "rotateY(0deg) rotate(45deg)", position: 'absolute', zIndex: 2, width: '25px', height: '25px', margin: '10px', opacity: 0 }} alt={"X"} />
                            <img src={headerPreview} alt="preview"
                                style={{ width: '100px', height: '100px', margin: '10px' }} />
                        </div>
                    )}
                </div>

                <Button type="submit">Save Changes</Button>

            </Form>
            </Modal.Body>
        </Modal>
    )
}
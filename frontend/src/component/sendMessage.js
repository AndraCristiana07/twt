import React, { useState } from "react";
import axiosInstance from "../../interceptor/axiosInstance";

export const SendMessage = () => {
    const [receiverId, setReceiverId] = useState("");
    const [content, setContent] = useState("");
    const apiUrl = process.env.REACT_APP_API_URL;
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`{apiUrl}/messages/send`, {
                receiver_id: receiverId,
                content: content
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log(response.data);  
            setReceiverId("");
            setContent("");
        } catch (error) {
            console.error(error); 
        }
    };

    return (
        <div>
            Send mesaage
        </div>
    )
}
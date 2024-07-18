import React, { useState } from "react";
import axios from "axios";

export const SendMessage = () => {
    const [receiverId, setReceiverId] = useState("");
    const [content, setContent] = useState("");
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log(apiUrl)

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const accessToken = localStorage.getItem('access_token');
    //         const response = await axios.post(`{apiUrl}/messages/send`, {
    //             receiver_id: receiverId,
    //             content: content
    //         }, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${accessToken}`
    //             }
    //         });
    //         console.log(response.data);  
    //         setReceiverId("");
    //         setContent("");
    //     } catch (error) {
    //         console.error(error); 
    //     }
    // };

    return (
        <div>
            Send mesaage
        </div>
    )
}
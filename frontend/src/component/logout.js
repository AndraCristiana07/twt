import React, { useEffect } from "react";
import axiosInstance from "../interceptor/axiosInstance";

export const performLogout = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;

    try {
        const accessToken = localStorage.getItem('access_token');
        const { data } = await axiosInstance.post(
            `${apiUrl}/logout/`,
            { refresh_token: localStorage.getItem('refresh_token') },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            }
        );

        window.location.href = '/login'; 
    } catch (error) {
        console.log("Logout failed", error);
    }
};

export const Logout = () => {
    useEffect(() => {
        performLogout();
    }, []);

    return (
        <div className="loader" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          
        </div>
    );
};




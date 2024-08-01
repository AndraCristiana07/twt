import React, { useEffect } from "react";
import axios from "axios";

export const performLogout = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;

    try {
        const { data } = await axios.post(
            `${apiUrl}/logout/`,
            { refresh_token: localStorage.getItem('refresh_token') },
            {
                headers: { 'Content-type': 'application/json' },
                withCredentials: true
            }
        );

        localStorage.clear();
        axios.defaults.headers.common['Authorization'] = null;
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




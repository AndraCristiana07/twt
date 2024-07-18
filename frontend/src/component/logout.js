// import { useEffect } from "react";
// import axios from "axios";
// import "../css/loader.css"
// // import dotenv from 'dotenv'
// // dotenv.config();

// export const Logout = () => {
//     const apiUrl = process.env.REACT_APP_API_URL;
//     console.log(apiUrl)
//     useEffect(() => {
//         const logout = async () => {
//             try {
//                 const { data } = await axios.post(`${apiUrl}/logout/`, 
//                             { refresh_token: localStorage.getItem('refresh_token') },
//                             { headers: { 'Content-type': 'application/json' }}, 
//                             {withCredentials: true }
//                 );
//                 localStorage.clear();
//                 axios.defaults.headers.common['Authorization'] = null;
//                 window.location.href = '/login';
//             } catch (error) {
//                 console.log("logout not working", error);
//             }
//         };

//         logout();
//     }, []);

//     return (
//         <div className="loader" style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
//             {/* Logging out... */}
//         </div>
//     );
// }

// Logout.jsx

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
        window.location.href = '/login';  // Redirect to login page after logout
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
            {/* Display a loading message if needed */}
        </div>
    );
};




import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
// import dotenv from 'dotenv'

// dotenv.config();
export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log(apiUrl)
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        const user = {
            email:email,
            password:password
        };

        try {
            const { data } = await axios.post(`${apiUrl}/token/`, user, {
                headers: {'Content-Type': 'application/json'},
                withCredentials: true
            });
            

            console.log(data);
            localStorage.clear();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            // localStorage.setItem('user_id', data.user_id);
            // console.log(localStorage.getItem('user_id'));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data['access']}`;
            // navigate('/');

            const userResponse = await axios.get(`${apiUrl}/get_user/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${data.access}`
                
                },
                withCredentials: true
            });
            localStorage.setItem('user_id', userResponse.data.id);
            localStorage.setItem('username', userResponse.data.username);
            window.location.href = '/';
        } catch (error) {
            console.error("Login failed", error);
            setError("Invalid password or error");
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md="5">
                    <h3 style={{display:'flex' ,justifyContent:'center', marginBottom:'30px'}}>Sign In</h3>
                    <Form onSubmit={submit}>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="text" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="formPassword" className="mt-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-4">Sign In</Button>
                        <Button variant="secondary" type="button" className="mt-4 ms-3" onClick={() => navigate('/register')}>Don't have account?</Button>
                    </Form>
                    {error && <Alert variant="danger">{error}</Alert>}  
                </Col>
            </Row>
        </Container>
    );
}

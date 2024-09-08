import { useState } from "react";
import axiosInstance from "../../interceptor/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

export const Register = () => {
    const [username, setUsername] = useState('andra');
    const [name, setName] = useState('andra');
    const [password, setPassword] = useState('andra');
    const [confirmPassword, setConfirmPassword] = useState('andra');
    const [email, setEmail] = useState('andra@gmail.com');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const user = {
            username,
            name,
            email,
            password
        };

        axiosInstance.post(`${apiUrl}/register/`, user)
            .then(response => {
                console.log(response.status)
                if (response.status === 201) {
                    navigate('/login');
                }
            })
            .catch(error => {
                setError(error.response.data.message || 'An error occurred.');
            })
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md="5">
                    <h3 style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>Register</h3>
                    <Form onSubmit={submit}>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="formName" className="mt-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="formPassword" className="mt-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="formConfirmPassword" className="mt-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="formEmail" className="mt-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </Form.Group>
                        {error && <div style={{ color: 'red' }}>{error}</div>}
                        <Button variant="primary" type="submit" className="mt-4">Register</Button>
                        {message && <div style={{ color: 'green' }}>{message}</div>}
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

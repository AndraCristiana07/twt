import { useState } from "react";
import axiosInstance from "../../interceptor/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

// export const Login = () => {
//     const [email, setEmail] = useState('andra@gmail.com');
//     const [password, setPassword] = useState('andra');
//     const [error, setError] = useState('');
//     const [message, setMessage] = useState('');
//     const apiUrl = process.env.REACT_APP_API_URL;
    
//     const navigate = useNavigate();

//     const submit = async (e) => {
//         e.preventDefault();
//         setError('');
//         const user = {
//             email:email,
//             password:password
//         };

//         // try {
//             const { data } = await axiosInstance.post(`${apiUrl}/token/`, user, {
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 withCredentials: true
//             }).then(response => {
//                 localStorage.setItem('access_token', data.access);
//                 localStorage.setItem('refresh_token', data.refresh);
//                 axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data['access']}`;

              
//                 axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data['access']}`;

//             window.location.href = '/';
//             })
//             .catch(error => {
//                 setError(error.response.data.message || 'An error occurred.')
//             })
//             const userResponse = await axiosInstance.get(`${apiUrl}/get_user/`, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${data.access}`
//                 },
//                 withCredentials: true
//             });
//             localStorage.setItem('user_id', userResponse.data.id);
//             localStorage.setItem('username', userResponse.data.username);

               
            
//         // } catch (error) {
//         //     console.error("Login failed", error);
//         //     console.log("aaaaa")
//         //     setError("Invalid password or email (TODO de ce sunt hardcodat?)");
//         // }
//     };

//     return (
//         <Container className="mt-5">
//             <Row className="justify-content-md-center">
//                 <Col md="5">
//                     <h3 style={{display:'flex' ,justifyContent:'center', marginBottom:'30px'}}>Sign In</h3>
//                     <Form onSubmit={submit}>
//                         <Form.Group controlId="formEmail">
//                             <Form.Label>Email</Form.Label>
//                             <Form.Control type="text" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                         </Form.Group>
//                         <Form.Group controlId="formPassword" className="mt-3">
//                             <Form.Label>Password</Form.Label>
//                             <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//                         </Form.Group>
//                         <Button variant="primary" type="submit" className="mt-4">Sign In</Button>
//                         <Button variant="secondary" type="button" className="mt-4 ms-3" onClick={() => navigate('/register')}>Don't have account?</Button>
//                     </Form>
//                     {error && <Alert variant="danger">{error}</Alert>}  
//                 </Col>
//             </Row>
//         </Container>
//     );
// }



// export const Login = () => {
//     const [email, setEmail] = useState('andra@gmail.com');
//     const [password, setPassword] = useState('andra');
//     const [error, setError] = useState('');
//     const apiUrl = process.env.REACT_APP_API_URL;
    
//     const navigate = useNavigate();

//     const submit = async (e) => {
//         e.preventDefault();
//         setError('');

//         const user = {
//             email: email,
//             password: password
//         };

//         try {
//             const { data } = await axiosInstance.post(`${apiUrl}/login/`, user, {
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 withCredentials: true
//             });

            
//             localStorage.setItem('access_token', data.access);
//             localStorage.setItem('refresh_token', data.refresh);

            
//             axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;

//             const userResponse = await axiosInstance.get(`${apiUrl}/get_user/`, {
//                 headers: {
//                     'Authorization': `Bearer ${data.access}`
//                 }
//             });

          
//             localStorage.setItem('user_id', userResponse.data.id);
//             localStorage.setItem('username', userResponse.data.username);

            
//             navigate('/');

//         } catch (error) {
//             setError(error.response?.data?.message || 'An error occurred.');
//         }
//     };

//     return (
//         <Container className="mt-5">
//             <Row className="justify-content-md-center">
//                 <Col md="5">
//                     <h3 style={{display: 'flex', justifyContent: 'center', marginBottom: '30px'}}>Sign In</h3>
//                     <Form onSubmit={submit}>
//                         <Form.Group controlId="formEmail">
//                             <Form.Label>Email</Form.Label>
//                             <Form.Control 
//                                 type="email" 
//                                 placeholder="Enter email" 
//                                 value={email} 
//                                 onChange={(e) => setEmail(e.target.value)} 
//                                 required 
//                             />
//                         </Form.Group>
//                         <Form.Group controlId="formPassword" className="mt-3">
//                             <Form.Label>Password</Form.Label>
//                             <Form.Control 
//                                 type="password" 
//                                 placeholder="Enter password" 
//                                 value={password} 
//                                 onChange={(e) => setPassword(e.target.value)} 
//                                 required 
//                             />
//                         </Form.Group>
//                         <Button variant="primary" type="submit" className="mt-4">Sign In</Button>
//                         <Button variant="secondary" type="button" className="mt-4 ms-3" onClick={() => navigate('/register')}>Don't have an account?</Button>
//                     </Form>
//                     {error && <Alert variant="danger" className="mt-3">{error}</Alert>}  
//                 </Col>
//             </Row>
//         </Container>
//     );
// };

export const Login = () => {
    const [email, setEmail] = useState('andra@gmail.com');
    const [password, setPassword] = useState('andra');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const apiUrl = process.env.REACT_APP_API_URL;
    
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        const user = {
            email:email,
            password:password
        };

        try {
            const { data } = await axiosInstance.post(`${apiUrl}/token/`, user, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data['access']}`;

            const userResponse = await axiosInstance.get(`${apiUrl}/get_user/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${data.access}`
                },
                withCredentials: true
            });
            localStorage.setItem('user_id', userResponse.data.id);
            localStorage.setItem('username', userResponse.data.username);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data['access']}`;

            window.location.href = '/';
            
        } catch (error) {
            console.error("Login failed", error);
            console.log("aaaaa")
            setError("Invalid password or email (TODO de ce sunt hardcodat?)");
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

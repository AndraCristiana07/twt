import React, {useState,useEffect} from "react";
import {Container, Col, Row, Form, Button, Card} from 'react-bootstrap';
import Menu from '../drawer';
import axiosInstance from "../../interceptor/axiosInstance";
import {useNavigate} from "react-router-dom";
import search from '../../assets/search.svg'

export const Search = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);


    useEffect(() => {
        const handleScroll = () => {
          if (
            window.innerHeight + document.documentElement.scrollTop + 1 >=
            document.documentElement.scrollHeight
          ) {
            if (!loading && hasMore) {
              setPage(prevPage => prevPage + 1);
            }
          }
        };
        window.addEventListener('scroll', handleScroll);
        
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, [loading, hasMore]); 

    useEffect(() => {
        if(query){
            fetchSearchRes(page)
        }
    }, [page, query])

    const fetchSearchRes = async (e, page) => {
        // e.preventDefault();
        setLoading(true);

        try {
            setLoading(true);

            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/search_user?q=${query}&page=${page}`, {
                params: {
                    page: page,
                    page_size: pageSize
                  },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log(response.data.users)
            setSearchResult(prev => [...prev, ...response.data.users]);
            setTotalUsers(response.data.total_users)
            setTotalPages(response.data.total_pages)
            setHasMore(page < response.data.total_pages)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    // const handleSearch = (e)=> {
    //     e.preventDefault();
    //     setSearchResult([])
    //     setPage(1)
    //     setHasMore(true)
    // }

    return (
        
        <>
            <Container className='container' fluid style={{marginTop: "7vh"}}>

                {/* <Form onSubmit={handleSearch}> */}
                    <Container fluid>
                        <Row>
                            <Col>
                                <Form.Group controlId="query">
                                    <Form.Control type="text" placeholder="Search" value={query}
                                                    onChange={handleInputChange}/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Button variant="primary" type="submit">
                                    <img src={search} alt="Search" style={{width: "25px", height: "25px"}}/>
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                {/* </Form> */}
                {loading && <p>Loading...</p>}
                {searchResult.length > 0 && (
                    <div style={{marginTop: "8vh"}}>
                        {searchResult.map((result) => (
                            <Card key={result.id} style={{marginTop: "2vh", cursor: "pointer"}}
                                    onClick={() => navigate(`/profile/${result.id}`)}>
                                <Card.Body>
                                    <Card.Title>{result.name}</Card.Title>
                                    <Card.Text>{result.username}</Card.Text>
                                </Card.Body>
                            </Card>

                        ))}
                    </div>
                )}
                {!loading && searchResult.length === 0 && <p style={{marginTop: "8vh"}}>No results found.</p>}


            </Container>

        </>

                


    )
};

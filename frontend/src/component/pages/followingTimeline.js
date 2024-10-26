import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import "../../css/home.css";
import Menu from "../drawer";
import axiosInstance from "../../interceptor/axiosInstance";
import { TweetCard } from "../tweetCard";
import { useNavigate } from "react-router-dom";
import { Mutex } from 'async-mutex'
import { TweetForm } from "../tweetFormPost";

export const FollowingTimeline = () => {
  const [tweets, setTweets] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalTweets, setTotalTweets] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false)
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [loadedData, setLoadedData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadPage, setLoadPage] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;

  const handleNavigation = (tweet) => {
    navigate(`/tweet/${tweet.id}`);

  }

  useEffect(() => {
    fetchAllTweets(page);
  
  }, [page]);

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

  

  const fetchAllTweets = async (page) => {
    try {
      setLoading(true);

      const accessToken = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`${apiUrl}/tweets/following_timeline/?page=${page}`,
        {
          params: {
            page: page,
            page_size: pageSize
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          withCredentials: true
        },
      );

      // setTweets(response.data.tweets)
      const sortedTweets = response.data.tweets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setTweets(prevItems => [...prevItems, ...sortedTweets]);
      console.log("tweet data "+ JSON.stringify(response.data.tweets))
      setTotalTweets(response.data.total_tweets)
      setTotalPages(response.data.total_pages)
      setHasMore(page < response.data.total_pages)
      // setPage(prevPage => prevPage + 1);

    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        // window.location.href = '/login';
        // navigate('/login')
      }
    }
    finally {
      setLoading(false);

    }
  };


  const handleLike = async (tweetId) => {
    try {

      const accessToken = localStorage.getItem('access_token');
      const response = await axiosInstance.post(`${apiUrl}/tweets/like/${tweetId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      });

      setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
        ...tweet,
        isLiked: true,
        likes: tweet.likes + 1
      } : tweet));

    } catch (error) {
      console.log(error);
    }
  };

  const handleUnlike = async (tweetId, likeId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axiosInstance.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      });

      setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
        ...tweet,
        isLiked: false,
        likes: tweet.likes - 1
      } : tweet));
    } catch (error) {
      console.log(error);
    }
  };

  const handleRetweet = async (tweetId, originalTweetId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axiosInstance.post(`${apiUrl}/tweets/retweet/${tweetId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      });

      setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
        ...tweet,
        isRetweeted: true,
        retweets: tweet.retweets + 1
      } : tweet));
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnretweet = async (tweetId, retweetId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axiosInstance.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      });

      setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
        ...tweet,
        isRetweeted: false,
        retweets: tweet.retweets - 1
      } : tweet));
    } catch (error) {
      console.log(error);
    }
  };

  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([]);

  return (
    <>
      {/* <VideoPlayer></VideoPlayer> */}
      {/* <TestThumbnail/> */}
      <Container fluid>
        <Card className="mt-5">
          <Card.Body>
              <TweetForm  />
                </Card.Body>
            </Card>
        </Container>
        <Container className="container mt-5 text-center">
        {loading ? <p key="loading_tweets"> Loading... </p> : (
        
          <>

            <div>
              {Array.isArray(tweets) && tweets.length > 0 ? (
                tweets.map(tweet => (
                  <TweetCard
                    key={tweet.id}
                    handleNavigation={handleNavigation}
                    tweetUrl={'get_tweet'}
                    originalTweetImg={tweet.original_tweet}
                    tweet={tweet}
                    handleLike={handleLike}
                    handleUnlike={handleUnlike}
                    handleRetweet={handleRetweet}
                    handleUnretweet={handleUnretweet} />
                ))
              ) : (
                <p>No tweets available.</p>
              )}
              {/* {
!loading &&
!hasMore &&
<div>
No more data
</div>
} */}

            </div></>
        )}
        {/* <Row className="pagination-controls">
          <Col>
            <Button disabled={page <= 1} onClick={() => setPage(page - 1)}> Previous</Button>

          </Col>
          <Col>
            <p>{page}</p>

          </Col>
          <Col>
            <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>

          </Col>
        </Row> */}
      </Container></>


  );
};

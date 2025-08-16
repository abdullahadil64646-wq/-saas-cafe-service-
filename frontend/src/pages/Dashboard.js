import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, ListGroup, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';

const Dashboard = () => {
  const { user, cafe } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [upcomingPosts, setUpcomingPosts] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch upcoming social media posts
        const postsRes = await axios.get('/api/social-media/posts');
        
        // Filter to get only upcoming scheduled posts
        const upcoming = postsRes.data
          .filter(post => post.status === 'scheduled' || post.status === 'ready')
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
          .slice(0, 5);
          
        setUpcomingPosts(upcoming);
        
        // Fetch payment history
        const paymentsRes = await axios.get('/api/payments/history');
        setPaymentHistory(paymentsRes.data.slice(0, 5));
        
      } catch (error) {
        setAlert('Failed to load dashboard data', 'danger');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [setAlert]);

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Welcome, {cafe?.name || 'Cafe Owner'}</Card.Title>
              <Card.Text>
                {cafe?.subscriptionPlan ? (
                  <>
                    You are currently on the <Badge variant="primary">{cafe.subscriptionPlan.name}</Badge> plan.
                    <br />
                    Your next billing date is {new Date(cafe.nextBillingDate).toLocaleDateString()}.
                  </>
                ) : (
                  <>
                    You don't have an active subscription plan.
                    <br />
                    <Link to="/pricing">View our plans</Link> to get started with our services.
                  </>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-grid gap-2">
                <Button as={Link} to="/social-media" variant="outline-primary" size="sm">
                  Schedule Post
                </Button>
                {cafe?.webStoreUrl ? (
                  <Button as={Link} to="/web-store" variant="outline-primary" size="sm">
                    Manage Web Store
                  </Button>
                ) : (
                  <Button as={Link} to="/pricing" variant="outline-primary" size="sm">
                    Get Web Store
                  </Button>
                )}
                <Button as={Link} to="/profile" variant="outline-secondary" size="sm">
                  Update Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header>Upcoming Social Media Posts</Card.Header>
            <ListGroup variant="flush">
              {upcomingPosts.length > 0 ? (
                upcomingPosts.map(post => (
                  <ListGroup.Item key={post._id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Badge variant={post.platform === 'instagram' ? 'danger' : 'primary'} className="me-2">
                          {post.platform}
                        </Badge>
                        {post.content?.substring(0, 50)}...
                      </div>
                      <small>
                        {post.scheduledDate ? new Date(post.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No upcoming posts scheduled.</ListGroup.Item>
              )}
            </ListGroup>
            <Card.Footer>
              <Link to="/social-media">View all posts</Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header>Recent Payments</Card.Header>
            <ListGroup variant="flush">
              {paymentHistory.length > 0 ? (
                paymentHistory.map(payment => (
                  <ListGroup.Item key={payment._id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Badge variant="success" className="me-2">{payment.plan.name}</Badge>
                        PKR {payment.amount}
                      </div>
                      <small>{new Date(payment.createdAt).toLocaleDateString()}</small>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No payment history.</ListGroup.Item>
              )}
            </ListGroup>
            <Card.Footer>
              <Link to="/billing">View billing history</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      {cafe?.webStoreUrl && (
        <Row>
          <Col md={12}>
            <Card className="shadow-sm mb-4">
              <Card.Header>Your Web Store</Card.Header>
              <Card.Body>
                <Card.Title>{cafe.name} Online Store</Card.Title>
                <Card.Text>
                  Your web store is live at: <a href={cafe.webStoreUrl} target="_blank" rel="noopener noreferrer">{cafe.webStoreUrl}</a>
                </Card.Text>
                <Button as={Link} to="/web-store" variant="primary">Manage Store</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
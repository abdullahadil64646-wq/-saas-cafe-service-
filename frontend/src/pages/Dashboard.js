import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, ListGroup, Badge, Button, ProgressBar, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/Authcontext';
import { AlertContext } from '../context/Alertcontext';

const Dashboard = () => {
  const { cafe } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch comprehensive dashboard data
        const analyticsRes = await api.get('/api/analytics/dashboard');
        const socialRes = await api.get('/api/social/posts');
        const campaignsRes = await api.get('/api/campaigns');
        
        const upcoming = socialRes.data
          .filter(post => post.status === 'scheduled' || post.status === 'ready')
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
          .slice(0, 5);

        setDashboardData({
          analytics: analyticsRes.data,
          upcomingPosts: upcoming,
          campaigns: campaignsRes.data.slice(0, 3)
        });
        
      } catch (error) {
        console.error('Dashboard error:', error);
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
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  const { analytics, upcomingPosts, campaigns } = dashboardData || {};

  return (
    <div className="dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-actions">
          <Button 
            as={Link} 
            to="/social-media" 
            variant="primary" 
            className="me-2"
          >
            📱 Create Post
          </Button>
          <Button 
            as={Link} 
            to="/campaigns" 
            variant="outline-primary"
          >
            🚀 New Campaign
          </Button>
        </div>
      </div>

      {/* Welcome Section */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="welcome-card shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="cafe-avatar me-3">
                  <div className="avatar-placeholder">
                    ☕
                  </div>
                </div>
                <div>
                  <Card.Title className="mb-1">Welcome back, {cafe?.name || 'Cafe Owner'}!</Card.Title>
                  <Card.Text className="text-muted mb-0">
                    {cafe?.subscriptionPlan ? (
                      <>
                        You're on the <Badge bg="primary">{cafe.subscriptionPlan.name}</Badge> plan.
                        Next billing: {new Date(cafe.nextBillingDate).toLocaleDateString()}
                      </>
                    ) : (
                      <>
                        <Link to="/pricing" className="text-decoration-none">
                          🎯 Choose a plan to unlock powerful features
                        </Link>
                      </>
                    )}
                  </Card.Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="quick-stats shadow-sm">
            <Card.Body>
              <Card.Title className="h6 text-muted mb-3">Quick Stats</Card.Title>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">{analytics?.overview?.totalPosts || 0}</div>
                  <div className="stat-label">Posts This Month</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{analytics?.overview?.activeCampaigns || 0}</div>
                  <div className="stat-label">Active Campaigns</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Analytics Overview */}
      {analytics && (
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card shadow-sm">
              <Card.Body>
                <div className="metric-header">
                  <span className="metric-icon">📊</span>
                  <span className="metric-title">Social Media</span>
                </div>
                <div className="metric-value">
                  {analytics.socialMedia?.totalPosts || 0}
                </div>
                <div className="metric-subtitle">Total Posts</div>
                <ProgressBar 
                  now={analytics.socialMedia?.successRate || 0} 
                  className="mt-2"
                  variant="success"
                />
                <small className="text-muted">
                  {analytics.socialMedia?.successRate || 0}% success rate
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card shadow-sm">
              <Card.Body>
                <div className="metric-header">
                  <span className="metric-icon">🎯</span>
                  <span className="metric-title">Campaigns</span>
                </div>
                <div className="metric-value">
                  ${analytics.campaigns?.totalSpend?.toFixed(2) || '0.00'}
                </div>
                <div className="metric-subtitle">Total Spend</div>
                <ProgressBar 
                  now={analytics.campaigns?.averageROAS * 20 || 0} 
                  className="mt-2"
                  variant="info"
                />
                <small className="text-muted">
                  {analytics.campaigns?.averageROAS || 0}x ROAS
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card shadow-sm">
              <Card.Body>
                <div className="metric-header">
                  <span className="metric-icon">📈</span>
                  <span className="metric-title">Growth</span>
                </div>
                <div className="metric-value">
                  {analytics.trends?.postsGrowth || '0%'}
                </div>
                <div className="metric-subtitle">Posts Growth</div>
                <div className="mt-2">
                  <Badge bg={analytics.trends?.trend === 'up' ? 'success' : 'warning'}>
                    {analytics.trends?.trend === 'up' ? '⬆️ Growing' : '📊 Stable'}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card shadow-sm">
              <Card.Body>
                <div className="metric-header">
                  <span className="metric-icon">💰</span>
                  <span className="metric-title">Conversions</span>
                </div>
                <div className="metric-value">
                  {analytics.campaigns?.totalConversions || 0}
                </div>
                <div className="metric-subtitle">Total Conversions</div>
                <div className="mt-2">
                  <small className="text-success">
                    💡 Keep posting regularly for better results
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="upcoming-posts shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>📅 Upcoming Posts</span>
              <Button 
                as={Link} 
                to="/social-media" 
                variant="outline-primary" 
                size="sm"
              >
                View All
              </Button>
            </Card.Header>
            <ListGroup variant="flush">
              {upcomingPosts && upcomingPosts.length > 0 ? (
                upcomingPosts.map(post => (
                  <ListGroup.Item key={post._id} className="post-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="post-platform mb-1">
                          <Badge 
                            bg={getPlatformColor(post.platform)}
                            className="me-2"
                          >
                            {getPlatformIcon(post.platform)} {post.platform}
                          </Badge>
                          <Badge bg={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                        <div className="post-content">
                          {post.content?.substring(0, 80)}...
                        </div>
                        <small className="text-muted">
                          📅 {post.scheduledDate 
                            ? new Date(post.scheduledDate).toLocaleDateString() 
                            : 'Not scheduled'
                          }
                        </small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center py-4">
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <p className="mb-2">No upcoming posts scheduled</p>
                    <Button 
                      as={Link} 
                      to="/social-media" 
                      variant="primary" 
                      size="sm"
                    >
                      Create Your First Post
                    </Button>
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="active-campaigns shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>🚀 Active Campaigns</span>
              <Button 
                as={Link} 
                to="/campaigns" 
                variant="outline-primary" 
                size="sm"
              >
                Manage All
              </Button>
            </Card.Header>
            <ListGroup variant="flush">
              {campaigns && campaigns.length > 0 ? (
                campaigns.map(campaign => (
                  <ListGroup.Item key={campaign._id} className="campaign-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="campaign-header mb-1">
                          <strong>{campaign.name}</strong>
                          <Badge 
                            bg={getCampaignStatusColor(campaign.status)}
                            className="ms-2"
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="campaign-type text-muted mb-2">
                          {getCampaignTypeIcon(campaign.type)} {campaign.type.replace('_', ' ')}
                        </div>
                        <div className="campaign-metrics">
                          <small className="text-muted">
                            💰 ${campaign.metrics?.spend || 0} spent | 
                            👁️ {campaign.metrics?.impressions || 0} impressions | 
                            🎯 {campaign.metrics?.conversions || 0} conversions
                          </small>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center py-4">
                  <div className="empty-state">
                    <div className="empty-icon">🚀</div>
                    <p className="mb-2">No active campaigns</p>
                    <Button 
                      as={Link} 
                      to="/campaigns" 
                      variant="primary" 
                      size="sm"
                    >
                      Create Your First Campaign
                    </Button>
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Recommendations */}
      {analytics?.recommendations && analytics.recommendations.length > 0 && (
        <Row>
          <Col>
            <Card className="recommendations shadow-sm">
              <Card.Header>💡 Recommendations</Card.Header>
              <Card.Body>
                <Row>
                  {analytics.recommendations.slice(0, 3).map((rec, index) => (
                    <Col lg={4} key={index} className="mb-3">
                      <div className={`recommendation-item priority-${rec.priority}`}>
                        <div className="rec-header">
                          <span className="rec-icon">
                            {getRecommendationIcon(rec.type)}
                          </span>
                          <span className="rec-title">{rec.title}</span>
                        </div>
                        <p className="rec-description">{rec.description}</p>
                        <Badge bg={getPriorityColor(rec.priority)}>
                          {rec.priority} priority
                        </Badge>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Web Store Section */}
      {cafe?.webStoreUrl && (
        <Row className="mt-4">
          <Col>
            <Card className="web-store shadow-sm">
              <Card.Header>🛍️ Your Web Store</Card.Header>
              <Card.Body>
                <Row className="align-items-center">
                  <Col lg={8}>
                    <Card.Title className="h5">{cafe.name} Online Store</Card.Title>
                    <Card.Text className="text-muted">
                      Your web store is live and ready for customers!
                    </Card.Text>
                    <a 
                      href={cafe.webStoreUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="store-link"
                    >
                      🔗 {cafe.webStoreUrl}
                    </a>
                  </Col>
                  <Col lg={4} className="text-end">
                    <Button 
                      as={Link} 
                      to="/web-store" 
                      variant="primary"
                      className="me-2"
                    >
                      Manage Store
                    </Button>
                    <Button 
                      href={cafe.webStoreUrl} 
                      target="_blank"
                      variant="outline-primary"
                    >
                      Visit Store
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

// Helper functions for styling
const getPlatformColor = (platform) => {
  const colors = {
    instagram: 'danger',
    facebook: 'primary',
    twitter: 'info'
  };
  return colors[platform] || 'secondary';
};

const getPlatformIcon = (platform) => {
  const icons = {
    instagram: '📷',
    facebook: '📘',
    twitter: '🐦'
  };
  return icons[platform] || '📱';
};

const getStatusColor = (status) => {
  const colors = {
    scheduled: 'success',
    ready: 'warning',
    posted: 'info',
    failed: 'danger'
  };
  return colors[status] || 'secondary';
};

const getCampaignStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    completed: 'info',
    draft: 'secondary'
  };
  return colors[status] || 'secondary';
};

const getCampaignTypeIcon = (type) => {
  const icons = {
    social_media: '📱',
    email: '📧',
    seo: '🔍',
    paid_ads: '💰',
    content_marketing: '📝'
  };
  return icons[type] || '🎯';
};

const getRecommendationIcon = (type) => {
  const icons = {
    content: '📝',
    marketing: '📢',
    strategy: '🎯',
    engagement: '💬'
  };
  return icons[type] || '💡';
};

const getPriorityColor = (priority) => {
  const colors = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  };
  return colors[priority] || 'secondary';
};

export default Dashboard;
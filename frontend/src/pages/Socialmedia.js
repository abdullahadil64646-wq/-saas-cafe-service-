import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, 
  Badge, ListGroup, Tabs, Tab, Spinner,
  ProgressBar, Dropdown
} from 'react-bootstrap';
import api from '../utils/api';
import { AlertContext } from '../context/Alertcontext';

const SocialMedia = () => {
  const { setAlert } = useContext(AlertContext);
  
  // State management
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showBulkSchedule, setShowBulkSchedule] = useState(false);
  const [showHashtagResearch, setShowHashtagResearch] = useState(false);
  
  // Form states
  const [newPost, setNewPost] = useState({
    platform: 'instagram',
    topic: 'default',
    tone: 'friendly',
    includeHashtags: true,
    targetAudience: '',
    scheduledDate: ''
  });
  
  const [bulkSchedule, setBulkSchedule] = useState({
    startDate: '',
    endDate: '',
    frequency: 'daily',
    platforms: ['instagram'],
    topics: ['default', 'coffee', 'special']
  });
  
  const [hashtagResearch, setHashtagResearch] = useState({
    keywords: ['coffee', 'cafe'],
    platforms: ['instagram'],
    location: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    fetchSocialMediaData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSocialMediaData = async () => {
    try {
      setIsLoading(true);
      
      const [postsRes, analyticsRes, hashtagsRes] = await Promise.all([
        api.get('/api/social/posts'),
        api.get('/api/social/analytics?period=30'),
        api.get('/api/hashtags')
      ]);
      
      setPosts(postsRes.data);
      setAnalytics(analyticsRes.data);
      setHashtags(hashtagsRes.data);
      
    } catch (error) {
      console.error('Error fetching social media data:', error);
      setAlert('Failed to load social media data', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      setIsGenerating(true);
      
      const response = await api.post('/api/social/generate-advanced-content', newPost);
      
      setPosts(prev => [response.data.post, ...prev]);
      setShowCreatePost(false);
      setAlert('Post created successfully!', 'success');
      
      // Reset form
      setNewPost({
        platform: 'instagram',
        topic: 'default',
        tone: 'friendly',
        includeHashtags: true,
        targetAudience: '',
        scheduledDate: ''
      });
      
    } catch (error) {
      console.error('Error creating post:', error);
      setAlert('Failed to create post', 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkSchedule = async () => {
    try {
      setIsGenerating(true);
      
      const response = await api.post('/api/social/bulk-schedule', bulkSchedule);
      
      setAlert(`Successfully scheduled ${response.data.posts.length} posts!`, 'success');
      setShowBulkSchedule(false);
      fetchSocialMediaData(); // Refresh data
      
    } catch (error) {
      console.error('Error bulk scheduling:', error);
      setAlert('Failed to schedule posts', 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHashtagResearch = async () => {
    try {
      setIsGenerating(true);
      
      const response = await api.post('/api/hashtags/research', hashtagResearch);
      
      setHashtags(prev => [...response.data.results, ...prev]);
      setAlert(`Researched ${response.data.results.length} new hashtags!`, 'success');
      setShowHashtagResearch(false);
      
    } catch (error) {
      console.error('Error researching hashtags:', error);
      setAlert('Failed to research hashtags', 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedulePost = async (postId, scheduledDate) => {
    try {
      await api.post('/api/social/schedule', { postId, scheduledDate });
      
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, scheduledDate, status: 'scheduled' }
          : post
      ));
      
      setAlert('Post scheduled successfully!', 'success');
    } catch (error) {
      console.error('Error scheduling post:', error);
      setAlert('Failed to schedule post', 'danger');
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading social media dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📱 Social Media Management</h2>
          <p className="text-muted mb-0">
            Automate and optimize your social media presence
          </p>
        </div>
        <div>
          <Dropdown className="d-inline me-2">
            <Dropdown.Toggle variant="primary" id="create-dropdown">
              ✨ Create
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowCreatePost(true)}>
                📝 Single Post
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowBulkSchedule(true)}>
                📅 Bulk Schedule
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowHashtagResearch(true)}>
                🔍 Research Hashtags
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="metric-icon me-3">📊</div>
                  <div>
                    <div className="metric-value">{analytics.overview?.totalPosts || 0}</div>
                    <div className="metric-label">Total Posts</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="metric-icon me-3">💬</div>
                  <div>
                    <div className="metric-value">{analytics.engagement?.averageEngagement || 0}</div>
                    <div className="metric-label">Avg Engagement</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="metric-icon me-3">📈</div>
                  <div>
                    <div className="metric-value">{analytics.trends?.weeklyGrowth || '0%'}</div>
                    <div className="metric-label">Weekly Growth</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="metric-icon me-3">🎯</div>
                  <div>
                    <div className="metric-value">{analytics.trends?.topPerformingPlatform || 'Instagram'}</div>
                    <div className="metric-label">Top Platform</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content Tabs */}
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="posts" title="📝 Posts">
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>Your Posts</span>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowCreatePost(true)}
                  >
                    ➕ New Post
                  </Button>
                </Card.Header>
                <ListGroup variant="flush">
                  {posts.length > 0 ? (
                    posts.slice(0, 10).map(post => (
                      <ListGroup.Item key={post._id} className="post-item">
                        <Row className="align-items-center">
                          <Col md={6}>
                            <div className="d-flex align-items-start">
                              <div className="platform-icon me-3">
                                {getPlatformIcon(post.platform)}
                              </div>
                              <div>
                                <div className="post-content mb-1">
                                  {post.content?.substring(0, 100)}...
                                </div>
                                <div className="post-meta">
                                  <Badge bg={getPlatformColor(post.platform)} className="me-2">
                                    {post.platform}
                                  </Badge>
                                  <Badge bg={getStatusColor(post.status)}>
                                    {post.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">
                              {post.scheduledDate 
                                ? `📅 ${new Date(post.scheduledDate).toLocaleDateString()}`
                                : '⏰ Not scheduled'
                              }
                            </small>
                          </Col>
                          <Col md={3} className="text-end">
                            {post.status === 'ready' && (
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => {
                                  const date = prompt('Enter schedule date (YYYY-MM-DD):');
                                  if (date) handleSchedulePost(post._id, date);
                                }}
                              >
                                📅 Schedule
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item className="text-center py-5">
                      <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h5>No posts yet</h5>
                        <p className="text-muted">Create your first social media post!</p>
                        <Button 
                          variant="primary"
                          onClick={() => setShowCreatePost(true)}
                        >
                          Create Post
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="mb-3">
                <Card.Header>🎯 Quick Actions</Card.Header>
                <Card.Body className="d-grid gap-2">
                  <Button 
                    variant="primary"
                    onClick={() => setShowCreatePost(true)}
                  >
                    ✨ Generate AI Content
                  </Button>
                  <Button 
                    variant="outline-primary"
                    onClick={() => setShowBulkSchedule(true)}
                  >
                    📅 Bulk Schedule
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setShowHashtagResearch(true)}
                  >
                    🔍 Research Hashtags
                  </Button>
                </Card.Body>
              </Card>

              {analytics?.recommendations && (
                <Card>
                  <Card.Header>💡 Recommendations</Card.Header>
                  <Card.Body>
                    {analytics.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="alert alert-info py-2">
                        <small>{rec}</small>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="hashtags" title="🏷️ Hashtags">
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>Hashtag Research</span>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowHashtagResearch(true)}
                  >
                    🔍 Research More
                  </Button>
                </Card.Header>
                <ListGroup variant="flush">
                  {hashtags.length > 0 ? (
                    hashtags.slice(0, 15).map(hashtag => (
                      <ListGroup.Item key={hashtag._id} className="hashtag-item">
                        <Row className="align-items-center">
                          <Col md={4}>
                            <strong>{hashtag.hashtag}</strong>
                            <br />
                            <Badge bg="secondary" className="me-1">{hashtag.platform}</Badge>
                            <Badge bg="info">{hashtag.category}</Badge>
                          </Col>
                          <Col md={3}>
                            <div className="metric-small">
                              <div>Popularity: {hashtag.metrics.popularity}/100</div>
                              <ProgressBar 
                                now={hashtag.metrics.popularity} 
                                size="sm" 
                                variant="success"
                              />
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="metric-small">
                              <div>Competition: {hashtag.metrics.competition}/100</div>
                              <ProgressBar 
                                now={hashtag.metrics.competition} 
                                size="sm" 
                                variant="warning"
                              />
                            </div>
                          </Col>
                          <Col md={2} className="text-end">
                            {hashtag.trending.isCurrentlyTrending && (
                              <Badge bg="danger">🔥 Trending</Badge>
                            )}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item className="text-center py-5">
                      <div className="empty-state">
                        <div className="empty-icon">🏷️</div>
                        <h5>No hashtag research yet</h5>
                        <p className="text-muted">Research hashtags to improve your reach!</p>
                        <Button 
                          variant="primary"
                          onClick={() => setShowHashtagResearch(true)}
                        >
                          Start Research
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>📊 Hashtag Insights</Card.Header>
                <Card.Body>
                  <div className="insight-item mb-3">
                    <strong>Total Researched:</strong> {hashtags.length}
                  </div>
                  <div className="insight-item mb-3">
                    <strong>Trending:</strong> {hashtags.filter(h => h.trending.isCurrentlyTrending).length}
                  </div>
                  <div className="insight-item mb-3">
                    <strong>High Engagement:</strong> {hashtags.filter(h => h.metrics.engagement > 5).length}
                  </div>
                  <hr />
                  <h6>Top Categories:</h6>
                  {getTopCategories(hashtags).map(cat => (
                    <Badge key={cat.name} bg="outline-primary" className="me-1 mb-1">
                      {cat.name} ({cat.count})
                    </Badge>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="analytics" title="📊 Analytics">
          <Row>
            <Col>
              <Card>
                <Card.Header>Analytics Dashboard</Card.Header>
                <Card.Body>
                  {analytics ? (
                    <div>
                      <Row className="mb-4">
                        <Col md={4}>
                          <Card className="text-center">
                            <Card.Body>
                              <h3>{analytics.engagement?.totalLikes || 0}</h3>
                              <p className="text-muted">Total Likes</p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="text-center">
                            <Card.Body>
                              <h3>{analytics.engagement?.totalComments || 0}</h3>
                              <p className="text-muted">Total Comments</p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="text-center">
                            <Card.Body>
                              <h3>{analytics.engagement?.totalShares || 0}</h3>
                              <p className="text-muted">Total Shares</p>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      
                      <h5>Platform Breakdown</h5>
                      {Object.entries(analytics.overview?.platformBreakdown || {}).map(([platform, count]) => (
                        <div key={platform} className="mb-2">
                          <div className="d-flex justify-content-between">
                            <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                            <span>{count} posts</span>
                          </div>
                          <ProgressBar now={(count / analytics.overview.totalPosts) * 100} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p>No analytics data available yet.</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Create Post Modal */}
      <Modal show={showCreatePost} onHide={() => setShowCreatePost(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>✨ Create AI-Generated Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Platform</Form.Label>
                  <Form.Select 
                    value={newPost.platform}
                    onChange={(e) => setNewPost(prev => ({ ...prev, platform: e.target.value }))}
                  >
                    <option value="instagram">📷 Instagram</option>
                    <option value="facebook">📘 Facebook</option>
                    <option value="twitter">🐦 Twitter</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Topic</Form.Label>
                  <Form.Select 
                    value={newPost.topic}
                    onChange={(e) => setNewPost(prev => ({ ...prev, topic: e.target.value }))}
                  >
                    <option value="default">☕ General Coffee</option>
                    <option value="special">🎉 Special Offer</option>
                    <option value="coffee">🌟 New Coffee</option>
                    <option value="event">🎵 Event</option>
                    <option value="morning">🌅 Morning</option>
                    <option value="lunch">🍽️ Lunch</option>
                    <option value="evening">🌙 Evening</option>
                    <option value="weekend">🏖️ Weekend</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tone</Form.Label>
                  <Form.Select 
                    value={newPost.tone}
                    onChange={(e) => setNewPost(prev => ({ ...prev, tone: e.target.value }))}
                  >
                    <option value="friendly">😊 Friendly</option>
                    <option value="professional">💼 Professional</option>
                    <option value="casual">😎 Casual</option>
                    <option value="engaging">🎯 Engaging</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Audience</Form.Label>
                  <Form.Select 
                    value={newPost.targetAudience}
                    onChange={(e) => setNewPost(prev => ({ ...prev, targetAudience: e.target.value }))}
                  >
                    <option value="">🎯 General</option>
                    <option value="young-professionals">👔 Young Professionals</option>
                    <option value="students">🎓 Students</option>
                    <option value="families">👨‍👩‍👧‍👦 Families</option>
                    <option value="remote-workers">💻 Remote Workers</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                label="Include researched hashtags"
                checked={newPost.includeHashtags}
                onChange={(e) => setNewPost(prev => ({ ...prev, includeHashtags: e.target.checked }))}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Schedule Date (Optional)</Form.Label>
              <Form.Control 
                type="datetime-local"
                value={newPost.scheduledDate}
                onChange={(e) => setNewPost(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreatePost(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreatePost}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Generating...
              </>
            ) : (
              '✨ Generate Post'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Schedule Modal */}
      <Modal show={showBulkSchedule} onHide={() => setShowBulkSchedule(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📅 Bulk Schedule Posts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control 
                    type="date"
                    value={bulkSchedule.startDate}
                    onChange={(e) => setBulkSchedule(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control 
                    type="date"
                    value={bulkSchedule.endDate}
                    onChange={(e) => setBulkSchedule(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Frequency</Form.Label>
              <Form.Select 
                value={bulkSchedule.frequency}
                onChange={(e) => setBulkSchedule(prev => ({ ...prev, frequency: e.target.value }))}
              >
                <option value="daily">📅 Daily</option>
                <option value="weekly">📋 Weekly</option>
                <option value="multiple_daily">⚡ Multiple Daily</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Platforms</Form.Label>
              <div>
                {['instagram', 'facebook', 'twitter'].map(platform => (
                  <Form.Check 
                    key={platform}
                    type="checkbox"
                    label={`${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                    checked={bulkSchedule.platforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkSchedule(prev => ({ 
                          ...prev, 
                          platforms: [...prev.platforms, platform] 
                        }));
                      } else {
                        setBulkSchedule(prev => ({ 
                          ...prev, 
                          platforms: prev.platforms.filter(p => p !== platform) 
                        }));
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkSchedule(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBulkSchedule}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Scheduling...
              </>
            ) : (
              '📅 Schedule Posts'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Hashtag Research Modal */}
      <Modal show={showHashtagResearch} onHide={() => setShowHashtagResearch(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔍 Research Hashtags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Keywords</Form.Label>
              <Form.Control 
                type="text"
                placeholder="Enter keywords separated by commas"
                value={hashtagResearch.keywords.join(', ')}
                onChange={(e) => setHashtagResearch(prev => ({ 
                  ...prev, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                }))}
              />
              <Form.Text className="text-muted">
                e.g., coffee, latte, espresso, local cafe
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Platforms</Form.Label>
              <div>
                {['instagram', 'facebook', 'twitter'].map(platform => (
                  <Form.Check 
                    key={platform}
                    type="checkbox"
                    label={`${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                    checked={hashtagResearch.platforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setHashtagResearch(prev => ({ 
                          ...prev, 
                          platforms: [...prev.platforms, platform] 
                        }));
                      } else {
                        setHashtagResearch(prev => ({ 
                          ...prev, 
                          platforms: prev.platforms.filter(p => p !== platform) 
                        }));
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Location (Optional)</Form.Label>
              <Form.Control 
                type="text"
                placeholder="e.g., New York, London"
                value={hashtagResearch.location}
                onChange={(e) => setHashtagResearch(prev => ({ ...prev, location: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHashtagResearch(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleHashtagResearch}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Researching...
              </>
            ) : (
              '🔍 Research Hashtags'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Helper functions
const getPlatformIcon = (platform) => {
  const icons = {
    instagram: '📷',
    facebook: '📘',
    twitter: '🐦'
  };
  return icons[platform] || '📱';
};

const getPlatformColor = (platform) => {
  const colors = {
    instagram: 'danger',
    facebook: 'primary',
    twitter: 'info'
  };
  return colors[platform] || 'secondary';
};

const getStatusColor = (status) => {
  const colors = {
    ready: 'warning',
    scheduled: 'success',
    posted: 'info',
    failed: 'danger',
    pending: 'secondary'
  };
  return colors[status] || 'secondary';
};

const getTopCategories = (hashtags) => {
  const categories = {};
  hashtags.forEach(h => {
    categories[h.category] = (categories[h.category] || 0) + 1;
  });
  
  return Object.entries(categories)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

export default SocialMedia;
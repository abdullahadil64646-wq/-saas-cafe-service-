import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, 
  Badge, Spinner, Tabs, Tab, ProgressBar
} from 'react-bootstrap';
import api from '../utils/api';
import { AuthContext } from '../context/Authcontext';
import { AlertContext } from '../context/Alertcontext';

const Campaigns = () => {
  const { setAlert } = useContext(AlertContext);
  
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'social_media',
    platforms: ['instagram'],
    targetAudience: {
      ageRange: '',
      interests: [],
      location: '',
      demographics: ''
    },
    budget: {
      total: '',
      daily: '',
      currency: 'USD'
    },
    schedule: {
      startDate: '',
      endDate: '',
      postFrequency: 1,
      timeSlots: ['09:00']
    },
    content: {
      hashtags: [],
      keywords: [],
      contentTemplates: []
    },
    automation: {
      autoPost: true,
      contentGeneration: true,
      zapierWebhookUrl: ''
    }
  });

  useEffect(() => {
    fetchCampaigns();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setAlert('Failed to fetch campaigns', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await api.post('/api/campaigns', newCampaign);
      setCampaigns(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      setAlert('Campaign created successfully!', 'success');
      
      // Reset form
      setNewCampaign({
        name: '',
        type: 'social_media',
        platforms: ['instagram'],
        targetAudience: { ageRange: '', interests: [], location: '', demographics: '' },
        budget: { total: '', daily: '', currency: 'USD' },
        schedule: { startDate: '', endDate: '', postFrequency: 1, timeSlots: ['09:00'] },
        content: { hashtags: [], keywords: [], contentTemplates: [] },
        automation: { autoPost: true, contentGeneration: true, zapierWebhookUrl: '' }
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      setAlert('Failed to create campaign', 'danger');
    }
  };

  const handleCampaignAction = async (campaignId, action) => {
    try {
      await api.post(`/api/campaigns/${campaignId}/${action}`);
      
      setCampaigns(prev => prev.map(campaign => 
        campaign._id === campaignId 
          ? { ...campaign, status: action === 'start' ? 'active' : 'paused' }
          : campaign
      ));
      
      setAlert(`Campaign ${action}ed successfully!`, 'success');
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
      setAlert(`Failed to ${action} campaign`, 'danger');
    }
  };

  const handleViewDetails = async (campaignId) => {
    try {
      const response = await api.get(`/api/campaigns/${campaignId}`);
      setSelectedCampaign(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      setAlert('Failed to fetch campaign details', 'danger');
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading campaigns...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🚀 Marketing Campaigns</h2>
          <p className="text-muted mb-0">
            Create and manage automated marketing campaigns
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Create Campaign
        </Button>
      </div>

      {/* Campaign Overview */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="metric-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="metric-icon me-3">📊</div>
                <div>
                  <div className="metric-value">{campaigns.length}</div>
                  <div className="metric-label">Total Campaigns</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="metric-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="metric-icon me-3">⚡</div>
                <div>
                  <div className="metric-value">
                    {campaigns.filter(c => c.status === 'active').length}
                  </div>
                  <div className="metric-label">Active</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="metric-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="metric-icon me-3">💰</div>
                <div>
                  <div className="metric-value">
                    ${campaigns.reduce((sum, c) => sum + (c.metrics?.spend || 0), 0).toFixed(2)}
                  </div>
                  <div className="metric-label">Total Spend</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="metric-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="metric-icon me-3">🎯</div>
                <div>
                  <div className="metric-value">
                    {campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0)}
                  </div>
                  <div className="metric-label">Conversions</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="campaigns" title="📋 All Campaigns">
          <Row>
            {campaigns.length > 0 ? (
              campaigns.map(campaign => (
                <Col lg={6} xl={4} key={campaign._id} className="mb-4">
                  <Card className="campaign-card h-100">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{campaign.name}</strong>
                        <div className="campaign-type">
                          {getCampaignTypeIcon(campaign.type)} {campaign.type.replace('_', ' ')}
                        </div>
                      </div>
                      <Badge bg={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="campaign-platforms mb-3">
                        {campaign.platforms.map(platform => (
                          <Badge 
                            key={platform} 
                            bg={getPlatformColor(platform)}
                            className="me-1"
                          >
                            {getPlatformIcon(platform)} {platform}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="campaign-metrics mb-3">
                        <Row>
                          <Col xs={6}>
                            <div className="metric-small">
                              <div className="metric-number">{campaign.metrics?.impressions || 0}</div>
                              <div className="metric-label">Impressions</div>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="metric-small">
                              <div className="metric-number">{campaign.metrics?.clicks || 0}</div>
                              <div className="metric-label">Clicks</div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                      
                      <div className="campaign-budget mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Budget:</span>
                          <span>${campaign.budget?.total || 0}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Spent:</span>
                          <span>${campaign.metrics?.spend || 0}</span>
                        </div>
                        <ProgressBar 
                          now={campaign.budget?.total > 0 ? (campaign.metrics?.spend / campaign.budget.total) * 100 : 0}
                          className="mt-2"
                          variant={
                            (campaign.metrics?.spend / campaign.budget?.total || 0) > 0.8 ? 'danger' : 'success'
                          }
                        />
                      </div>
                      
                      {campaign.automation?.autoPost && (
                        <div className="automation-indicator mb-3">
                          <Badge bg="info">🤖 Automated</Badge>
                        </div>
                      )}
                    </Card.Body>
                    <Card.Footer>
                      <div className="d-flex justify-content-between">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleViewDetails(campaign._id)}
                        >
                          📊 Details
                        </Button>
                        
                        {campaign.status === 'draft' && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleCampaignAction(campaign._id, 'start')}
                          >
                            ▶️ Start
                          </Button>
                        )}
                        
                        {campaign.status === 'active' && (
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => handleCampaignAction(campaign._id, 'pause')}
                          >
                            ⏸️ Pause
                          </Button>
                        )}
                        
                        {campaign.status === 'paused' && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleCampaignAction(campaign._id, 'start')}
                          >
                            ▶️ Resume
                          </Button>
                        )}
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <Card className="text-center py-5">
                  <Card.Body>
                    <div className="empty-state">
                      <div className="empty-icon">🚀</div>
                      <h5>No campaigns yet</h5>
                      <p className="text-muted">Create your first marketing campaign to start automating your social media!</p>
                      <Button 
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                      >
                        Create Your First Campaign
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Tab>
        
        <Tab eventKey="templates" title="📝 Templates">
          <Row>
            <Col lg={4} className="mb-4">
              <Card className="template-card h-100">
                <Card.Body>
                  <div className="template-icon mb-3">📱</div>
                  <h5>Social Media Boost</h5>
                  <p className="text-muted">
                    Increase your social media presence with automated posting and engagement
                  </p>
                  <ul className="template-features">
                    <li>Daily automated posts</li>
                    <li>AI content generation</li>
                    <li>Hashtag optimization</li>
                    <li>Multi-platform posting</li>
                  </ul>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => {
                      setNewCampaign(prev => ({
                        ...prev,
                        name: 'Social Media Boost Campaign',
                        type: 'social_media',
                        platforms: ['instagram', 'facebook'],
                        automation: { autoPost: true, contentGeneration: true }
                      }));
                      setShowCreateModal(true);
                    }}
                  >
                    Use Template
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4} className="mb-4">
              <Card className="template-card h-100">
                <Card.Body>
                  <div className="template-icon mb-3">🔍</div>
                  <h5>Local SEO Campaign</h5>
                  <p className="text-muted">
                    Improve your local search visibility and attract nearby customers
                  </p>
                  <ul className="template-features">
                    <li>Local keyword targeting</li>
                    <li>Google My Business optimization</li>
                    <li>Location-based content</li>
                    <li>Review management</li>
                  </ul>
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      setNewCampaign(prev => ({
                        ...prev,
                        name: 'Local SEO Campaign',
                        type: 'seo',
                        content: {
                          keywords: ['local cafe', 'coffee near me', 'best coffee shop'],
                          hashtags: ['#localcafe', '#coffeenearme', '#localbusiness']
                        }
                      }));
                      setShowCreateModal(true);
                    }}
                  >
                    Use Template
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4} className="mb-4">
              <Card className="template-card h-100">
                <Card.Body>
                  <div className="template-icon mb-3">📧</div>
                  <h5>Email Marketing</h5>
                  <p className="text-muted">
                    Connect with customers through targeted email campaigns
                  </p>
                  <ul className="template-features">
                    <li>Welcome email series</li>
                    <li>Promotional campaigns</li>
                    <li>Customer retention</li>
                    <li>Automated follow-ups</li>
                  </ul>
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      setNewCampaign(prev => ({
                        ...prev,
                        name: 'Email Marketing Campaign',
                        type: 'email',
                        automation: { autoPost: true, contentGeneration: true }
                      }));
                      setShowCreateModal(true);
                    }}
                  >
                    Use Template
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Create Campaign Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🚀 Create New Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Campaign Name</Form.Label>
              <Form.Control 
                type="text"
                placeholder="e.g., Summer Coffee Promotion"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Campaign Type</Form.Label>
                  <Form.Select 
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="social_media">📱 Social Media</option>
                    <option value="email">📧 Email Marketing</option>
                    <option value="seo">🔍 SEO Campaign</option>
                    <option value="paid_ads">💰 Paid Advertising</option>
                    <option value="content_marketing">📝 Content Marketing</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Platforms</Form.Label>
                  <div>
                    {['instagram', 'facebook', 'twitter'].map(platform => (
                      <Form.Check 
                        key={platform}
                        type="checkbox"
                        label={`${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                        checked={newCampaign.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewCampaign(prev => ({ 
                              ...prev, 
                              platforms: [...prev.platforms, platform] 
                            }));
                          } else {
                            setNewCampaign(prev => ({ 
                              ...prev, 
                              platforms: prev.platforms.filter(p => p !== platform) 
                            }));
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Budget ($)</Form.Label>
                  <Form.Control 
                    type="number"
                    value={newCampaign.budget.total}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, total: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Daily Budget ($)</Form.Label>
                  <Form.Control 
                    type="number"
                    value={newCampaign.budget.daily}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, daily: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control 
                    type="date"
                    value={newCampaign.schedule.startDate}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      schedule: { ...prev.schedule, startDate: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control 
                    type="date"
                    value={newCampaign.schedule.endDate}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      schedule: { ...prev.schedule, endDate: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Target Audience</Form.Label>
              <Row>
                <Col md={6}>
                  <Form.Control 
                    type="text"
                    placeholder="Age range (e.g., 25-45)"
                    value={newCampaign.targetAudience.ageRange}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      targetAudience: { ...prev.targetAudience, ageRange: e.target.value }
                    }))}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control 
                    type="text"
                    placeholder="Location (e.g., New York)"
                    value={newCampaign.targetAudience.location}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      targetAudience: { ...prev.targetAudience, location: e.target.value }
                    }))}
                  />
                </Col>
              </Row>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Automation Settings</Form.Label>
              <div>
                <Form.Check 
                  type="checkbox"
                  label="🤖 Auto-post content"
                  checked={newCampaign.automation.autoPost}
                  onChange={(e) => setNewCampaign(prev => ({ 
                    ...prev, 
                    automation: { ...prev.automation, autoPost: e.target.checked }
                  }))}
                />
                <Form.Check 
                  type="checkbox"
                  label="✨ Generate content with AI"
                  checked={newCampaign.automation.contentGeneration}
                  onChange={(e) => setNewCampaign(prev => ({ 
                    ...prev, 
                    automation: { ...prev.automation, contentGeneration: e.target.checked }
                  }))}
                />
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Zapier Webhook URL (Optional)</Form.Label>
              <Form.Control 
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={newCampaign.automation.zapierWebhookUrl}
                onChange={(e) => setNewCampaign(prev => ({ 
                  ...prev, 
                  automation: { ...prev.automation, zapierWebhookUrl: e.target.value }
                }))}
              />
              <Form.Text className="text-muted">
                Connect to Zapier for advanced automation workflows
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateCampaign}>
            🚀 Create Campaign
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Campaign Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📊 Campaign Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCampaign && (
            <div>
              <h5>{selectedCampaign.name}</h5>
              <Badge bg={getStatusColor(selectedCampaign.status)} className="mb-3">
                {selectedCampaign.status}
              </Badge>
              
              <Row className="mb-4">
                <Col md={3}>
                  <div className="metric-card">
                    <div className="metric-value">{selectedCampaign.metrics?.impressions || 0}</div>
                    <div className="metric-label">Impressions</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="metric-card">
                    <div className="metric-value">{selectedCampaign.metrics?.clicks || 0}</div>
                    <div className="metric-label">Clicks</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="metric-card">
                    <div className="metric-value">{selectedCampaign.metrics?.conversions || 0}</div>
                    <div className="metric-label">Conversions</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="metric-card">
                    <div className="metric-value">${selectedCampaign.metrics?.spend || 0}</div>
                    <div className="metric-label">Spend</div>
                  </div>
                </Col>
              </Row>
              
              <h6>Campaign Settings</h6>
              <p><strong>Type:</strong> {selectedCampaign.type.replace('_', ' ')}</p>
              <p><strong>Platforms:</strong> {selectedCampaign.platforms.join(', ')}</p>
              <p><strong>Budget:</strong> ${selectedCampaign.budget?.total || 0} total, ${selectedCampaign.budget?.daily || 0} daily</p>
              
              {selectedCampaign.targetAudience && (
                <div>
                  <h6>Target Audience</h6>
                  <p><strong>Age Range:</strong> {selectedCampaign.targetAudience.ageRange || 'Not specified'}</p>
                  <p><strong>Location:</strong> {selectedCampaign.targetAudience.location || 'Not specified'}</p>
                </div>
              )}
              
              {selectedCampaign.automation && (
                <div>
                  <h6>Automation</h6>
                  <p>Auto-post: {selectedCampaign.automation.autoPost ? '✅ Enabled' : '❌ Disabled'}</p>
                  <p>Content Generation: {selectedCampaign.automation.contentGeneration ? '✅ Enabled' : '❌ Disabled'}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Helper functions
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

const getStatusColor = (status) => {
  const colors = {
    draft: 'secondary',
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'danger'
  };
  return colors[status] || 'secondary';
};

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

export default Campaigns;
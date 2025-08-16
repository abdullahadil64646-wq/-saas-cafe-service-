import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, 
  Table, Badge, Alert, Spinner, Tabs, Tab,
  OverlayTrigger, Tooltip
} from 'react-bootstrap';
import api from '../utils/api';
import { AuthContext } from '../context/Authcontext';
import { AlertContext } from '../context/Alertcontext';

const LeadManagement = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('leads');
  
  const [newLead, setNewLead] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      googleMaps: ''
    },
    source: 'manual',
    notes: ''
  });
  
  const [scrapeSettings, setScrapeSettings] = useState({
    location: '',
    businessType: 'cafe',
    radius: 10
  });

  const [filters, setFilters] = useState({
    status: '',
    source: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchLeads();
      fetchStats();
    }
  }, [user, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/api/leads?${params}`);
      setLeads(response.data.leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setAlert('Failed to fetch leads', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/leads/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddLead = async () => {
    try {
      const response = await api.post('/api/leads', newLead);
      setLeads(prev => [response.data, ...prev]);
      setShowAddLead(false);
      setAlert('Lead added successfully!', 'success');
      
      // Reset form
      setNewLead({
        businessName: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        socialMedia: { instagram: '', facebook: '', googleMaps: '' },
        source: 'manual',
        notes: ''
      });
      
      fetchStats(); // Update stats
    } catch (error) {
      console.error('Error adding lead:', error);
      setAlert('Failed to add lead', 'danger');
    }
  };

  const handleScrapeLeads = async () => {
    try {
      const response = await api.post('/api/leads/scrape/google-maps', scrapeSettings);
      setAlert(response.data.msg, 'success');
      setShowScrapeModal(false);
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error scraping leads:', error);
      setAlert('Failed to scrape leads', 'danger');
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      await api.put(`/api/leads/${leadId}`, { contactStatus: newStatus });
      setLeads(prev => prev.map(lead => 
        lead._id === leadId ? { ...lead, contactStatus: newStatus } : lead
      ));
      setAlert('Lead status updated!', 'success');
      fetchStats();
    } catch (error) {
      console.error('Error updating lead:', error);
      setAlert('Failed to update lead status', 'danger');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <h4>Access Denied</h4>
          <p>Lead management is only available for admin users.</p>
        </Alert>
      </Container>
    );
  }

  if (isLoading && !leads.length) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading leads...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🎯 Lead Management</h2>
          <p className="text-muted mb-0">
            Manage and track potential cafe clients
          </p>
        </div>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => setShowScrapeModal(true)}
          >
            🔍 Scrape Leads
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowAddLead(true)}
          >
            ➕ Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="metric-icon me-3">👥</div>
                  <div>
                    <div className="metric-value">{stats.overview.total}</div>
                    <div className="metric-label">Total Leads</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="metric-icon me-3">🆕</div>
                  <div>
                    <div className="metric-value">{stats.overview.new}</div>
                    <div className="metric-label">New Leads</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="metric-icon me-3">✅</div>
                  <div>
                    <div className="metric-value">{stats.overview.converted}</div>
                    <div className="metric-label">Converted</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="metric-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="metric-icon me-3">📈</div>
                  <div>
                    <div className="metric-value">{stats.overview.conversionRate}%</div>
                    <div className="metric-label">Conversion Rate</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="converted">Converted</option>
                  <option value="declined">Declined</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Source</Form.Label>
                <Form.Select 
                  value={filters.source}
                  onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                >
                  <option value="">All Sources</option>
                  <option value="google_maps">Google Maps</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="website_scraping">Website Scraping</option>
                  <option value="manual">Manual</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>&nbsp;</Form.Label>
                <div className="d-grid">
                  <Button variant="outline-primary" onClick={fetchLeads}>
                    🔍 Filter
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Content */}
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="leads" title="📋 All Leads">
          <Card>
            <Table responsive>
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map(lead => (
                    <tr key={lead._id}>
                      <td>
                        <div>
                          <strong>{lead.businessName}</strong>
                          {lead.location?.city && (
                            <div className="text-muted small">
                              📍 {lead.location.city}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          {lead.email && (
                            <div>📧 {lead.email}</div>
                          )}
                          {lead.phone && (
                            <div>📞 {lead.phone}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={getSourceColor(lead.source)}>
                          {lead.source.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusColor(lead.contactStatus)}>
                          {lead.contactStatus}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Contact</Tooltip>}
                          >
                            <Button 
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleUpdateLeadStatus(lead._id, 'contacted')}
                              disabled={lead.contactStatus === 'contacted'}
                            >
                              📞
                            </Button>
                          </OverlayTrigger>
                          
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Mark as Interested</Tooltip>}
                          >
                            <Button 
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleUpdateLeadStatus(lead._id, 'interested')}
                              disabled={lead.contactStatus === 'interested'}
                            >
                              ⭐
                            </Button>
                          </OverlayTrigger>
                          
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Convert</Tooltip>}
                          >
                            <Button 
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleUpdateLeadStatus(lead._id, 'converted')}
                              disabled={lead.contactStatus === 'converted'}
                            >
                              ✅
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h5>No leads found</h5>
                        <p className="text-muted">Start by adding leads or scraping from Google Maps</p>
                        <Button 
                          variant="primary"
                          onClick={() => setShowAddLead(true)}
                        >
                          Add First Lead
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </Tab>

        <Tab eventKey="analytics" title="📊 Analytics">
          <Row>
            <Col lg={6}>
              <Card className="mb-4">
                <Card.Header>📈 Lead Sources</Card.Header>
                <Card.Body>
                  {stats?.sourceBreakdown?.map(source => (
                    <div key={source._id} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>{source._id.replace('_', ' ')}</span>
                        <span>{source.count} leads</span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar bg-primary"
                          style={{ 
                            width: `${(source.count / stats.overview.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6}>
              <Card className="mb-4">
                <Card.Header>📅 Monthly Trend</Card.Header>
                <Card.Body>
                  {stats?.monthlyStats?.map(month => (
                    <div key={`${month._id.year}-${month._id.month}`} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>{month._id.month}/{month._id.year}</span>
                        <span>{month.count} leads</span>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Add Lead Modal */}
      <Modal show={showAddLead} onHide={() => setShowAddLead(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>➕ Add New Lead</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Business Name *</Form.Label>
                  <Form.Control 
                    type="text"
                    value={newLead.businessName}
                    onChange={(e) => setNewLead(prev => ({ ...prev, businessName: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control 
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control 
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control 
                    type="url"
                    value={newLead.website}
                    onChange={(e) => setNewLead(prev => ({ ...prev, website: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control 
                type="text"
                value={newLead.address}
                onChange={(e) => setNewLead(prev => ({ ...prev, address: e.target.value }))}
              />
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Instagram</Form.Label>
                  <Form.Control 
                    type="text"
                    value={newLead.socialMedia.instagram}
                    onChange={(e) => setNewLead(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Facebook</Form.Label>
                  <Form.Control 
                    type="text"
                    value={newLead.socialMedia.facebook}
                    onChange={(e) => setNewLead(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Google Maps</Form.Label>
                  <Form.Control 
                    type="text"
                    value={newLead.socialMedia.googleMaps}
                    onChange={(e) => setNewLead(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, googleMaps: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Source</Form.Label>
              <Form.Select 
                value={newLead.source}
                onChange={(e) => setNewLead(prev => ({ ...prev, source: e.target.value }))}
              >
                <option value="manual">Manual Entry</option>
                <option value="google_maps">Google Maps</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="website_scraping">Website Scraping</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                value={newLead.notes}
                onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddLead(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddLead}>
            ➕ Add Lead
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Scrape Leads Modal */}
      <Modal show={showScrapeModal} onHide={() => setShowScrapeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔍 Scrape Leads from Google Maps</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>Note:</strong> This is a demo implementation. In production, this would connect to Google Places API.
          </Alert>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control 
                type="text"
                placeholder="e.g., New York, NY"
                value={scrapeSettings.location}
                onChange={(e) => setScrapeSettings(prev => ({ ...prev, location: e.target.value }))}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Business Type</Form.Label>
              <Form.Select 
                value={scrapeSettings.businessType}
                onChange={(e) => setScrapeSettings(prev => ({ ...prev, businessType: e.target.value }))}
              >
                <option value="cafe">Cafe</option>
                <option value="coffee_shop">Coffee Shop</option>
                <option value="restaurant">Restaurant</option>
                <option value="bakery">Bakery</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Radius (km)</Form.Label>
              <Form.Range 
                min="1"
                max="50"
                value={scrapeSettings.radius}
                onChange={(e) => setScrapeSettings(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              />
              <div className="text-center">
                <small className="text-muted">{scrapeSettings.radius} km</small>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowScrapeModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleScrapeLeads}>
            🔍 Start Scraping
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Helper functions
const getSourceColor = (source) => {
  const colors = {
    google_maps: 'success',
    facebook: 'primary',
    instagram: 'danger',
    website_scraping: 'info',
    manual: 'secondary'
  };
  return colors[source] || 'secondary';
};

const getStatusColor = (status) => {
  const colors = {
    new: 'primary',
    contacted: 'warning',
    interested: 'info',
    converted: 'success',
    declined: 'danger'
  };
  return colors[status] || 'secondary';
};

export default LeadManagement;
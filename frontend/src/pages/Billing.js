import React from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';

const Billing = () => {
  return (
    <Container className="mt-5">
      <h2 className="mb-4">Billing & Subscription</h2>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h4>Current Plan</h4>
              <p>You are currently on the <strong>Pro Plan</strong></p>
              <p>Next billing date: March 15, 2025</p>
              <Button variant="outline-primary" className="me-2">Change Plan</Button>
              <Button variant="outline-danger">Cancel Subscription</Button>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <h4>Billing History</h4>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Feb 15, 2025</td>
                    <td>$59.00</td>
                    <td>Paid</td>
                    <td><Button size="sm">PDF</Button></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Billing;
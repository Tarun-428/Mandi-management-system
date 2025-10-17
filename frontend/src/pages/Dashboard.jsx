import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <>
      <Navbar />
      <Container>
        <h2 className="mb-4">Welcome, {user.company_name}</h2>
        
        <Row>
          <Col md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Create New Bill</Card.Title>
                <Card.Text>
                  Generate a new bill for farmers with multiple vegetable entries
                </Card.Text>
                <Button variant="primary" onClick={() => navigate('/bills/create')}>
                  Create Bill
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Manage Bills</Card.Title>
                <Card.Text>
                  View, edit, and manage all bills with filtering options
                </Card.Text>
                <Button variant="primary" onClick={() => navigate('/bills')}>
                  View Bills
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Merchants</Card.Title>
                <Card.Text>
                  Manage merchants, view trades, and track credit entries
                </Card.Text>
                <Button variant="primary" onClick={() => navigate('/merchants')}>
                  View Merchants
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Farmers</Card.Title>
                <Card.Text>
                  View daily farmer records and transaction summaries
                </Card.Text>
                <Button variant="primary" onClick={() => navigate('/farmers')}>
                  View Farmers
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Merchant Summary</Card.Title>
                <Card.Text>
                  Day-wise merchant trade summary with commission details
                </Card.Text>
                <Button variant="primary" onClick={() => navigate('/merchant-summary')}>
                  View Summary
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Adhatiya Income</Card.Title>
                <Card.Text>
                  Track commission income from merchant trades
                </Card.Text>
                <Button variant="primary" onClick={() => navigate('/adhatiya-income')}>
                  View Income
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Dashboard

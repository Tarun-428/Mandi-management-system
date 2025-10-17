import React, { useState, useEffect } from 'react'
import { Container, Table, Form, Row, Col, Card, Alert } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import { farmersAPI } from '../services/api'

function Farmers() {
  const [farmers, setFarmers] = useState([])
  const [summary, setSummary] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  useEffect(() => {
    loadFarmers()
  }, [date])

  const loadFarmers = async () => {
    try {
      const response = await farmersAPI.getAll(date)
      setFarmers(response.data.farmers)
      setSummary(response.data.summary)
    } catch (err) {
      setError('Failed to load farmers data')
    }
  }

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <h2 className="mb-4">Farmers Day-wise Records</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Select Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body className="text-center">
                <h5>Total Farmers</h5>
                <h3>{summary.total_farmers || 0}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body className="text-center">
                <h5>Total Bags</h5>
                <h3>{summary.total_bags || 0}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body className="text-center">
                <h5>Total Weight</h5>
                <h3>{summary.total_weight || 0} kg</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body className="text-center">
                <h5>Total Amount</h5>
                <h3>₹{summary.total_amount?.toFixed(2) || 0}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Farmer Name</th>
              <th>Mobile</th>
              <th>Village</th>
              <th>Vegetables</th>
              <th>Total Bags</th>
              <th>Total Weight (kg)</th>
              <th>Total Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map((farmer) => (
              <tr key={farmer.id}>
                <td>{farmer.bill_number}</td>
                <td>{farmer.farmer_name}</td>
                <td>{farmer.farmer_mobile || '-'}</td>
                <td>{farmer.village_name}</td>
                <td>{farmer.vegetables}</td>
                <td>{farmer.total_bags}</td>
                <td>{farmer.total_weight}</td>
                <td>₹{farmer.grand_total}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {farmers.length === 0 && (
          <div className="text-center py-5">
            <p>No farmer records found for this date</p>
          </div>
        )}
      </Container>
    </>
  )
}

export default Farmers

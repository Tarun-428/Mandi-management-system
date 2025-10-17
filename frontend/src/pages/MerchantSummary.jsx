import React, { useState, useEffect } from 'react'
import { Container, Card, Table, Form, Row, Col, Alert } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import { merchantsAPI } from '../services/api'

function MerchantSummary() {
  const [summary, setSummary] = useState([])
  const [totals, setTotals] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  useEffect(() => {
    loadSummary()
  }, [date])

  const loadSummary = async () => {
    try {
      const response = await merchantsAPI.getSummary(date)
      setSummary(response.data.summary)
      setTotals({
        grand_total: response.data.grand_total,
        total_commission: response.data.total_commission,
        total_bags: response.data.total_bags,
        total_weight: response.data.total_weight
      })
    } catch (err) {
      setError('Failed to load merchant summary')
    }
  }

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <h2 className="mb-4">Merchant Summary (Day-wise)</h2>

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

        {summary.map((merchantData, index) => (
          <Card key={index} className="mb-4">
            <Card.Header>
              <h5>{merchantData.merchant?.name || 'Unknown Merchant'}</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Vegetable</th>
                    <th>Quantity (kg)</th>
                    <th>Bags</th>
                    <th>Weight (kg)</th>
                    <th>Rate (₹/kg)</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {merchantData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.vegetable}</td>
                      <td>{item.quantity}</td>
                      <td>{item.bags}</td>
                      <td>{item.weight}</td>
                      <td>₹{item.rate}</td>
                      <td>₹{item.amount}</td>
                    </tr>
                  ))}
                  <tr className="table-secondary">
                    <td colSpan="5"><strong>Subtotal</strong></td>
                    <td><strong>₹{merchantData.subtotal.toFixed(2)}</strong></td>
                  </tr>
                  <tr className="table-info">
                    <td colSpan="5"><strong>Adhatiya (2%)</strong></td>
                    <td><strong>₹{merchantData.commission.toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </Table>
              <div className="mt-2">
                <strong>Total Bags:</strong> {merchantData.total_bags} | 
                <strong> Total Weight:</strong> {merchantData.total_weight} kg
              </div>
            </Card.Body>
          </Card>
        ))}

        {summary.length === 0 && (
          <div className="text-center py-5">
            <p>No merchant trades found for this date</p>
          </div>
        )}

        {summary.length > 0 && (
          <Card className="bg-light">
            <Card.Body>
              <h4>Grand Totals</h4>
              <Row className="mt-3">
                <Col md={3}>
                  <strong>Total Bags:</strong> {totals.total_bags}
                </Col>
                <Col md={3}>
                  <strong>Total Weight:</strong> {totals.total_weight} kg
                </Col>
                <Col md={3}>
                  <strong>Grand Total:</strong> ₹{totals.grand_total?.toFixed(2)}
                </Col>
                <Col md={3}>
                  <strong>Total Income:</strong> ₹{totals.total_commission?.toFixed(2)}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  )
}

export default MerchantSummary

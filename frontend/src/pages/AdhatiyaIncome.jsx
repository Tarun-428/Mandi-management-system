import React, { useState, useEffect } from 'react'
import { Container, Table, Form, Row, Col, Card, Alert } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import { incomeAPI } from '../services/api'

function AdhatiyaIncome() {
  const [incomes, setIncomes] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    loadIncome()
  }, [])

  const loadIncome = async () => {
    try {
      const response = await incomeAPI.getAll(filters)
      setIncomes(response.data.incomes)
      setTotalIncome(response.data.total_income)
    } catch (err) {
      setError('Failed to load income data')
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleFilter = () => {
    loadIncome()
  }

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <h2 className="mb-4">Adhatiya Income Tracking</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>&nbsp;</Form.Label>
              <button className="btn btn-success w-100" onClick={handleFilter}>
                Filter
              </button>
            </Form.Group>
          </Col>
        </Row>

        <Card className="mb-4 summary-card">
          <Card.Body className="text-center">
            <h5>Total Adhatiya Income</h5>
            <h2>₹{totalIncome.toFixed(2)}</h2>
          </Card.Body>
        </Card>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant Name</th>
              <th>Trade Amount (₹)</th>
              <th>Commission Rate (%)</th>
              <th>Commission Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((income) => (
              <tr key={income.id}>
                <td>{new Date(income.date).toLocaleDateString()}</td>
                <td>{income.merchant_name}</td>
                <td>₹{income.trade_amount.toFixed(2)}</td>
                <td>{income.commission_rate}%</td>
                <td>₹{income.commission_amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {incomes.length === 0 && (
          <div className="text-center py-5">
            <p>No income records found</p>
          </div>
        )}
      </Container>
    </>
  )
}

export default AdhatiyaIncome

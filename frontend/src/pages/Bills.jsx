import React, { useState, useEffect } from 'react'
import { Container, Table, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { billsAPI, merchantsAPI } from '../services/api'

function Bills() {
  const [bills, setBills] = useState([])
  const [merchants, setMerchants] = useState([])
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    farmer_name: '',
    village_name: '',
    merchant_id: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadBills()
    loadMerchants()
  }, [])

  const loadBills = async () => {
    try {
      const response = await billsAPI.getAll(filters)
      setBills(response.data)
    } catch (err) {
      setError('Failed to load bills')
    }
  }

  const loadMerchants = async () => {
    try {
      const response = await merchantsAPI.getAll()
      setMerchants(response.data)
    } catch (err) {
      console.error('Failed to load merchants')
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleFilter = () => {
    loadBills()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await billsAPI.delete(id)
        loadBills()
      } catch (err) {
        setError('Failed to delete bill')
      }
    }
  }

  const handlePrint = (id) => {
    window.open(`/bills/print/${id}`, '_blank')
  }

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Bills Management</h2>
          <Button variant="primary" onClick={() => navigate('/bills/create')}>
            Create New Bill
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-4">
          <Col md={3}>
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
          <Col md={3}>
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
          <Col md={2}>
            <Form.Group>
              <Form.Label>Farmer Name</Form.Label>
              <Form.Control
                type="text"
                name="farmer_name"
                value={filters.farmer_name}
                onChange={handleFilterChange}
                placeholder="Search..."
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Village</Form.Label>
              <Form.Control
                type="text"
                name="village_name"
                value={filters.village_name}
                onChange={handleFilterChange}
                placeholder="Search..."
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>&nbsp;</Form.Label>
              <Button variant="success" className="w-100" onClick={handleFilter}>
                Filter
              </Button>
            </Form.Group>
          </Col>
        </Row>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Farmer Name</th>
              <th>Village</th>
              <th>Total Bags</th>
              <th>Total Weight</th>
              <th>Grand Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td>{bill.bill_number}</td>
                <td>{bill.farmer_name}</td>
                <td>{bill.village_name}</td>
                <td>{bill.total_bags}</td>
                <td>{bill.total_weight} kg</td>
                <td>₹{bill.grand_total}</td>
                <td>{new Date(bill.created_at).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handlePrint(bill.id)}
                  >
                    Print
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/bills/edit/${bill.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(bill.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {bills.length === 0 && (
          <div className="text-center py-5">
            <p>No bills found</p>
          </div>
        )}
      </Container>
    </>
  )
}

export default Bills

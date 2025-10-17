import React, { useState, useEffect } from 'react'
import { Container, Card, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { billsAPI, merchantsAPI } from '../services/api'

const VEGETABLES = ['Onion', 'Garlic', 'Potato', 'Tomato', 'Cabbage', 'Cauliflower', 'Other']

function CreateBill() {
  const [merchants, setMerchants] = useState([])
  const [formData, setFormData] = useState({
    farmer_name: '',
    farmer_mobile: '',
    village_name: '',
    himmali: 0,
    motor_bhada: 0,
    other_charges: 0
  })
  const [items, setItems] = useState([{
    vegetable: '',
    quantity: '',
    bags: '',
    weight: '',
    rate: '',
    amount: 0,
    merchant_id: ''
  }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadMerchants()
  }, [])

  const loadMerchants = async () => {
    try {
      const response = await merchantsAPI.getAll()
      setMerchants(response.data)
    } catch (err) {
      setError('Failed to load merchants')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value

    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(newItems[index].quantity) || 0
      const rate = parseFloat(newItems[index].rate) || 0
      newItems[index].amount = qty * rate
    }

    if (field === 'bags') {
      const totalBags = newItems.reduce((sum, item) => sum + (parseInt(item.bags) || 0), 0)
      setFormData({ ...formData, himmali: totalBags * 8 })
    }

    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, {
      vegetable: '',
      quantity: '',
      bags: '',
      weight: '',
      rate: '',
      amount: 0,
      merchant_id: ''
    }])
  }

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    
    const totalBags = newItems.reduce((sum, item) => sum + (parseInt(item.bags) || 0), 0)
    setFormData({ ...formData, himmali: totalBags * 8 })
  }

  const calculateTotals = () => {
    const totalBags = items.reduce((sum, item) => sum + (parseInt(item.bags) || 0), 0)
    const totalQuantity = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)
    const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0)
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    const grandTotal = subtotal + parseFloat(formData.himmali || 0) + parseFloat(formData.motor_bhada || 0) + parseFloat(formData.other_charges || 0)

    return { totalBags, totalQuantity, totalWeight, subtotal, grandTotal }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const billData = {
        ...formData,
        items: items.map(item => ({
          vegetable: item.vegetable,
          quantity: parseFloat(item.quantity),
          bags: parseInt(item.bags),
          weight: parseFloat(item.weight),
          rate: parseFloat(item.rate),
          amount: parseFloat(item.amount),
          merchant_id: item.merchant_id || null
        }))
      }

      await billsAPI.create(billData)
      navigate('/bills')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bill')
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <h2 className="mb-4">Create New Bill</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Farmer Details</h5>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Farmer Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="farmer_name"
                      value={formData.farmer_name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="farmer_mobile"
                      value={formData.farmer_mobile}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Village Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="village_name"
                      value={formData.village_name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Vegetable Items</h5>
                <Button variant="success" size="sm" onClick={addItem}>
                  Add Vegetable
                </Button>
              </div>

              <Table responsive>
                <thead>
                  <tr>
                    <th>Vegetable</th>
                    <th>Quantity (kg)</th>
                    <th>Bags</th>
                    <th>Weight (kg)</th>
                    <th>Rate (₹/kg)</th>
                    <th>Merchant</th>
                    <th>Amount (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Select
                          value={item.vegetable}
                          onChange={(e) => handleItemChange(index, 'vegetable', e.target.value)}
                          required
                        >
                          <option value="">Select</option>
                          {VEGETABLES.map(veg => (
                            <option key={veg} value={veg}>{veg}</option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={item.bags}
                          onChange={(e) => handleItemChange(index, 'bags', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={item.weight}
                          onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <Form.Select
                          value={item.merchant_id}
                          onChange={(e) => handleItemChange(index, 'merchant_id', e.target.value)}
                        >
                          <option value="">Select Merchant</option>
                          {merchants.map(merchant => (
                            <option key={merchant.id} value={merchant.id}>
                              {merchant.name}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>₹{item.amount.toFixed(2)}</td>
                      <td>
                        {items.length > 1 && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <h5>Additional Charges</h5>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Himmali (Auto-calculated @ ₹8/bag)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="himmali"
                      value={formData.himmali}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Motor Bhada</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="motor_bhada"
                      value={formData.motor_bhada}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Other Charges</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="other_charges"
                      value={formData.other_charges}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body className="bg-light">
              <h5>Summary</h5>
              <Row>
                <Col md={3}>
                  <strong>Total Bags:</strong> {totals.totalBags}
                </Col>
                <Col md={3}>
                  <strong>Total Quantity:</strong> {totals.totalQuantity} kg
                </Col>
                <Col md={3}>
                  <strong>Total Weight:</strong> {totals.totalWeight} kg
                </Col>
                <Col md={3}>
                  <strong>Subtotal:</strong> ₹{totals.subtotal.toFixed(2)}
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <h4>Grand Total: ₹{totals.grandTotal.toFixed(2)}</h4>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="mb-4">
            <Button variant="primary" type="submit" className="me-2" disabled={loading}>
              {loading ? 'Creating...' : 'Create & Print Bill'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/bills')}>
              Cancel
            </Button>
          </div>
        </Form>
      </Container>
    </>
  )
}

export default CreateBill

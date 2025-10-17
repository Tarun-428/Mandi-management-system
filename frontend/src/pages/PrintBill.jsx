import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Button } from 'react-bootstrap'
import { billsAPI } from '../services/api'

function PrintBill() {
  const { id } = useParams()
  const [bill, setBill] = useState(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadBill()
  }, [id])

  const loadBill = async () => {
    try {
      const response = await billsAPI.getById(id)
      setBill(response.data)
    } catch (err) {
      console.error('Failed to load bill')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!bill) return <div>Loading...</div>

  return (
    <Container className="mt-4">
      <div className="no-print mb-3">
        <Button variant="primary" onClick={handlePrint}>
          Print Bill
        </Button>
      </div>

      <div className="print-container print-bill">
        <div className="bill-header">
          <h2>{user.company_name}</h2>
          <p>Mandi Management System</p>
          <h4>Bill Number: {bill.bill_number}</h4>
          <p>Date: {new Date(bill.created_at).toLocaleDateString()}</p>
        </div>

        <div className="mb-3">
          <table style={{ width: '100%', border: 'none' }}>
            <tbody>
              <tr>
                <td style={{ border: 'none' }}><strong>Farmer Name:</strong> {bill.farmer_name}</td>
                <td style={{ border: 'none' }}><strong>Mobile:</strong> {bill.farmer_mobile || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}><strong>Village:</strong> {bill.village_name}</td>
                <td style={{ border: 'none' }}><strong>Merchant:</strong> {bill.merchant?.name || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <table>
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
            {bill.items.map((item, index) => (
              <tr key={index}>
                <td>{item.vegetable}</td>
                <td>{item.quantity}</td>
                <td>{item.bags}</td>
                <td>{item.weight}</td>
                <td>₹{item.rate}</td>
                <td>₹{item.amount}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="5" style={{ textAlign: 'right' }}><strong>Subtotal:</strong></td>
              <td><strong>₹{bill.subtotal}</strong></td>
            </tr>
            {bill.himmali > 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'right' }}>Himmali:</td>
                <td>₹{bill.himmali}</td>
              </tr>
            )}
            {bill.motor_bhada > 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'right' }}>Motor Bhada:</td>
                <td>₹{bill.motor_bhada}</td>
              </tr>
            )}
            {bill.other_charges > 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'right' }}>Other Charges:</td>
                <td>₹{bill.other_charges}</td>
              </tr>
            )}
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <td colSpan="5" style={{ textAlign: 'right' }}><strong>Grand Total:</strong></td>
              <td><strong>₹{bill.grand_total}</strong></td>
            </tr>
          </tbody>
        </table>

        <div className="bill-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
            <div>
              <p>_________________</p>
              <p>Farmer Signature</p>
            </div>
            <div>
              <p>_________________</p>
              <p>Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default PrintBill

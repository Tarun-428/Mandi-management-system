# Mandi Management System

## Overview
A comprehensive web-based Mandi Management System built with Python Flask backend and React frontend for managing vegetable trading operations, merchants, farmers, bills, and commission tracking.

## Recent Changes
- **October 17, 2025**: Initial system implementation completed
  - Full-stack application with Flask REST API backend
  - React frontend with Bootstrap styling
  - Complete CRUD operations for bills, merchants, and transactions
  - Automated adhatiya (commission) calculation system
  - Printable bill generation with unique bill numbers
  - Day-wise farmer and merchant summaries
  - Credit entry management for merchants

## Project Architecture

### Backend (Flask)
- **Framework**: Python Flask with SQLAlchemy ORM
- **Database**: SQLite (local, lightweight)
- **Structure**: Modular blueprint-based architecture
  - `/auth` - Authentication and profile management
  - `/bills` - Bill creation, editing, deletion, filtering
  - `/merchants` - Merchant management and credit entries
  - `/farmers` - Day-wise farmer records
  - `/income` - Adhatiya income tracking

### Frontend (React)
- **Framework**: React 18 with Vite
- **Styling**: Bootstrap 5 + React-Bootstrap
- **Routing**: React Router DOM
- **API Communication**: Axios

### Database Models
1. **User**: Company admin with partners management (max 10)
2. **Merchant**: Merchant details with opening/current balance
3. **Bill**: Main bill entity with farmer details and totals
4. **BillItem**: Individual vegetable entries in bills
5. **Transaction**: Credit entries for merchants
6. **AdhatiyaIncome**: Automatic 2% commission tracking

## Key Features

### 1. Authentication System
- Register/Login with company details
- Profile management with partner addition (up to 10)
- JWT token-based authentication

### 2. Bill Management
- Create bills with multiple vegetable entries per farmer
- Auto-calculated himmali @ ₹8 per bag (editable)
- Motor bhada and other charges support
- Unique bill number generation
- Edit/Delete bills with merchant balance adjustment
- Filter bills by date range, farmer, village, merchant
- Printable bill format with company header

### 3. Merchant Management
- Add merchants with opening balance
- View merchant profile with complete trade history
- Add credit entries (Cash/Online/Cheque)
- Automatic balance tracking
- 2% adhatiya commission auto-calculation

### 4. Farmers Tab
- Day-wise farmer records
- Summary totals (farmers, bags, weight, amount)
- Filter by date

### 5. Merchant Summary
- Day-wise merchant trade breakdown
- Per-merchant subtotals and commission
- Grand totals with total income display

### 6. Adhatiya Income
- Commission tracking (2% of merchant trades)
- Filter by date range
- Total income calculation

## Technical Stack

### Backend Dependencies
- Flask
- Flask-SQLAlchemy
- Flask-CORS
- Flask-Bcrypt
- Flask-JWT-Extended

### Frontend Dependencies
- React
- React Router DOM
- React Bootstrap
- Bootstrap
- Axios
- Vite

## Running the Application

### Backend Server
- Port: 8000
- Command: `cd backend && python run.py`
- Database: SQLite (`backend/mandi.db`)

### Frontend Server
- Port: 5000
- Command: `cd frontend && npm run dev`
- Access: http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new company
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get profile
- PUT `/api/auth/profile` - Update profile

### Bills
- GET `/api/bills` - Get all bills (with filters)
- POST `/api/bills` - Create bill
- GET `/api/bills/:id` - Get bill by ID
- PUT `/api/bills/:id` - Update bill
- DELETE `/api/bills/:id` - Delete bill

### Merchants
- GET `/api/merchants` - Get all merchants
- POST `/api/merchants` - Create merchant
- GET `/api/merchants/:id` - Get merchant profile
- PUT `/api/merchants/:id` - Update merchant
- DELETE `/api/merchants/:id` - Delete merchant
- POST `/api/merchants/:id/credit` - Add credit entry
- GET `/api/merchants/summary` - Get day-wise summary

### Farmers
- GET `/api/farmers` - Get day-wise farmer records

### Income
- GET `/api/income` - Get adhatiya income records
- GET `/api/income/summary` - Get income summary

## Environment Configuration
- `SESSION_SECRET`: Secret key for JWT and session management

## Features Highlights
- ✅ Multi-vegetable entries per bill
- ✅ Automatic calculations (totals, commission, himmali)
- ✅ Printable bills with browser print
- ✅ Merchant balance tracking
- ✅ Day-wise summaries and reports
- ✅ Date range filtering
- ✅ Clean Bootstrap UI
- ✅ Responsive design
- ✅ JWT authentication
- ✅ Complete CRUD operations

## Next Steps (Future Enhancements)
- Export to Excel/PDF
- Advanced reporting with charts
- SMS/WhatsApp notifications
- Backup and restore
- Multi-user role-based access

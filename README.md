# Tailor Management System

An advanced, full-stack enterprise management system designed specifically for tailor shops, boutique studios, and apparel manufacturing businesses. Built with **Node.js/Express/MongoDB** on the backend and **React 18/Vite/Tailwind CSS** on the frontend, featuring multi-language internationalization (i18n), multi-theme support (Dark & Light modes), PDF invoice generation, measurement sheets with custom SVG diagrams, and a full-featured Order Review side drawer.

---

## Table of Contents

- [Features Overview](#features-overview)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation & Running the Project](#installation--running-the-project)
- [API Endpoints Reference](#api-endpoints-reference)
- [Supported Garment Types & Measurements](#supported-garment-types--measurements)
- [Internationalization (i18n)](#internationalization-i18n)
- [Theme System](#theme-system)

---

## Features Overview

### 1. Dashboard & Analytics
- Real-time business KPIs: Total Customers, Active Orders, Total Income, Pending Payments.
- Interactive **Income vs Expenses** trend charts powered by Recharts.
- **Order Status Distribution** pie chart (Pending, Cutting, Stitching, Trial, Ready, Delivered, Cancelled).
- **Recent Orders Table** with direct row-click review drawer integration.

### 2. Orders Management & Order Review Drawer
- Create and manage multi-item orders with dynamic line items and auto-calculated totals.
- Track order stages: `pending` → `cutting` → `stitching` → `trial` → `ready` → `delivered` → `cancelled`.
- Priority tags: `low`, `normal`, `high`, `urgent`.
- **Order Review Side Panel (Portal Drawer)**:
  - Slide-in side drawer rendered directly to `document.body` via React `createPortal`.
  - Comprehensive customer summary, booking & delivery dates, and tailor assignments.
  - Payment breakdown (Per Unit, Total, Advance Paid, Balance Due).
  - Complete payment transaction history log.
  - Itemized garment details.
  - Linked measurements preview with visual indicator icons.
  - Action buttons: Quick Edit modal, Record Payment modal, PDF Invoice print, WhatsApp customer messaging with auto-formatted message, and Order Deletion.

### 3. Measurement Studio & Print Sheets
- Pre-configured body measurement specs for 10 garment categories:
  - **Shirt**, **Pant**, **Kurta**, **Shalwar**, **Trouser**, **Coat**, **Waistcoat**, **Sherwani**, **Blazer**, and **Custom**.
- Visual SVG measurement icons for each body dimension (Neck, Chest, Waist, Hip, Shoulder, Back Width, Sleeve, Armhole, Bicep, Cuff, Wrist, Rise, Thigh, Knee, Bottom, Inseam, Outseam, Length, Front/Back Length, Neck Depth, Collar Height, Side Slit, Pancha).
- Version tracking (`v1`, `v2`, etc.) for measurement adjustments over time.
- **Printable A4 Measurement Sheet** formatted for workshop tailors with customer and tailor signature sections.

### 4. Payments & Customer Ledger
- Support for multiple payment methods: `Cash`, `Bank Transfer`, `Credit/Debit Card`, `EasyPaisa`, `JazzCash`, and `Online`.
- Payment classification: `advance`, `partial`, `full`, and `refund`.
- Automated **Double-Entry Customer Ledger** tracking debits, credits, and live balance per customer.

### 5. Expense Tracking & Financial Reports
- Categorized expense logging (Rent, Salary, Material/Fabric, Utilities, Repairs, Transport, Internet, etc.).
- Financial reports: Monthly Profit & Loss, Sales Revenue, and Delivery Schedules.
- Automatic PDF invoice generation using PDFKit on the backend.

### 6. Multi-Language (i18n) & Multi-Theme
- **5 Languages**: English (`en`), Urdu (`ur`), Pashto (`ps`), Arabic (`ar`), and Italian (`it`).
- **Dark & Light Modes**: Deep space dark mode + multiple light theme variants (Default, Light Purple, Light Blue) with smooth CSS token transitions.

---

## Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS + Custom CSS Variables Design System
- **State & Forms**: React Hook Form
- **Icons**: Lucide React + Custom SVG Icons
- **Charts**: Recharts
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **Localization**: i18next & react-i18next

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT Access & Refresh Tokens) with HTTP-only cookies
- **Security**: bcryptjs, CORS, express-rate-limit, express-validator
- **Document Generation**: PDFKit (Vector PDF Invoices)

---

## Project Architecture

```
Tailor_Management_system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection (MongoDB)
│   │   ├── controllers/     # Route handlers for auth, orders, customers, etc.
│   │   ├── middleware/      # JWT auth, validation, rate limiting, error handlers
│   │   ├── models/          # Mongoose schemas (User, Customer, Order, Measurement, Payment, Expense, Ledger, Staff)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & PDF generation services
│   │   ├── utils/           # Database seed scripts & helper utilities
│   │   ├── app.js           # Express app configuration & middleware
│   │   └── server.js        # Server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/             # Axios API client functions (orders, customers, payments, etc.)
│   │   ├── components/
│   │   │   ├── common/      # Reusable UI (Modal, Badge, DataTable, PageHeader, StatCard, ThemeSwitcher, LanguageSwitcher)
│   │   │   ├── layout/      # Sidebar, Navbar, App Layout
│   │   │   └── orders/      # OrderReviewDrawer, MeasurementSection
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── i18n/            # i18n configuration and translation files (en, ur, ps, ar, it)
│   │   ├── pages/           # Dashboard, Orders, Customers, Measurements, Payments, Ledger, Expenses, Reports, Staff, Settings, Login
│   │   ├── utils/           # Helpers, currency formatting, measurementConfig.jsx
│   │   ├── App.jsx          # Route declarations & ProtectedRoute wrappers
│   │   ├── main.jsx         # React DOM entry point
│   │   └── index.css        # Multi-theme design tokens & custom styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

---

## Prerequisites

Before running the application, make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher) or **yarn** / **pnpm**
- **MongoDB** (Local MongoDB instance or a free MongoDB Atlas connection string)

---

## Environment Setup

Create `.env` files in both the `backend` and `frontend` directories based on the templates below.

### Backend `.env` (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
MONGODB_URI=mongodb://localhost:27017/tailor_management
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tailor_management?retryWrites=true&w=majority

# JWT Secrets & Expiry
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
REFRESH_TOKEN_EXPIRY=7d

# CORS Allowed Origin
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env` (`frontend/.env`)

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api
```

---

## Installation & Running the Project

### 1. Start the Backend Server

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Seed the database with sample admin, customer, order, and measurement data:
   ```bash
   npm run seed
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   # Or standard start:
   npm start
   ```
   The backend API will run on `http://localhost:5000`.

---

### 2. Start the Frontend Application

1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## API Endpoints Reference

All API routes are prefixed with `/api/v1/`.

| Resource | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | User login (returns JWT token & sets cookie) |
| | `POST` | `/api/v1/auth/logout` | Clear refresh token and logout |
| | `GET` | `/api/v1/auth/me` | Fetch currently authenticated user |
| | `POST` | `/api/v1/auth/refresh-token` | Refresh expired access token |
| **Customers** | `GET` | `/api/v1/customers` | Get all customers with search & pagination |
| | `POST` | `/api/v1/customers` | Create new customer |
| | `GET` | `/api/v1/customers/:id` | Get customer details |
| | `PUT` | `/api/v1/customers/:id` | Update customer |
| | `DELETE` | `/api/v1/customers/:id` | Delete customer |
| **Orders** | `GET` | `/api/v1/orders` | List orders (filterable by status, customer) |
| | `POST` | `/api/v1/orders` | Create new order with garment items |
| | `GET` | `/api/v1/orders/:id` | Retrieve order by ID |
| | `PUT` | `/api/v1/orders/:id` | Update order items / status |
| | `DELETE` | `/api/v1/orders/:id` | Delete order |
| **Measurements**| `GET` | `/api/v1/measurements` | List customer measurements |
| | `POST` | `/api/v1/measurements` | Save measurements for customer & garment type |
| | `PUT` | `/api/v1/measurements/:id` | Update existing measurement |
| | `DELETE` | `/api/v1/measurements/:id`| Delete measurement record |
| **Payments** | `GET` | `/api/v1/payments` | Get payment transactions (filter by order/customer) |
| | `POST` | `/api/v1/payments` | Record new payment |
| **Ledger** | `GET` | `/api/v1/ledger/:customerId` | Retrieve double-entry customer ledger account |
| **Expenses** | `GET` | `/api/v1/expenses` | List shop expenses by category and date |
| | `POST` | `/api/v1/expenses` | Record new expense |
| **Reports** | `GET` | `/api/v1/reports/dashboard` | Aggregated dashboard KPI numbers & charts |
| | `GET` | `/api/v1/reports/profit-loss`| Profit & Loss report |
| | `GET` | `/api/v1/reports/delivery` | Order delivery schedule report |
| **Invoices** | `GET` | `/api/v1/invoices/:orderId`| Generate and download PDF invoice |

---

## Supported Garment Types & Measurements

The system includes pre-defined measurement field mappings in `frontend/src/utils/measurementConfig.jsx`:

| Clothing Type | Supported Body Measurement Fields |
| :--- | :--- |
| **Shirt** | Neck, Chest, Waist, Hip, Shoulder, Sleeve, Armhole, Bicep, Cuff, Length |
| **Pant** | Waist, Hip, Rise, Thigh, Knee, Bottom, Inseam, Outseam, Length |
| **Kurta** | Neck, Chest, Waist, Hip, Shoulder, Sleeve, Armhole, Bicep, Cuff, Length, Side Slit |
| **Shalwar** | Waist, Hip, Thigh, Length, Bottom, Pancha |
| **Trouser** | Waist, Hip, Rise, Thigh, Knee, Bottom, Inseam, Outseam, Length |
| **Coat / Blazer** | Neck, Chest, Waist, Hip, Shoulder, Back Width, Sleeve, Armhole, Bicep, Wrist, Length |
| **Waistcoat** | Chest, Waist, Hip, Shoulder, Armhole, Neck Depth, Front Length, Back Length |
| **Sherwani** | Neck, Chest, Waist, Hip, Shoulder, Back Width, Sleeve, Armhole, Bicep, Wrist, Length, Collar Height, Side Slit |
| **Custom** | All measurement dimensions enabled |

---

## Internationalization (i18n)

The application supports real-time language switching without page reloads:
- 🇬🇧 **English** (`en`)
- 🇵🇰 **Urdu** (`ur`) — with RTL layout support
- 🇦🇫 **Pashto** (`ps`) — with RTL layout support
- 🇸🇦 **Arabic** (`ar`) — with RTL layout support
- 🇮🇹 **Italian** (`it`)

Translation keys are located in `frontend/src/i18n/locales/`.

---

## Theme System

The user interface uses CSS custom properties defined in `frontend/src/index.css`:
- **Dark Theme (Default)**: Optimized for workshop environments and low-light eye comfort.
- **Light Theme**: Clean, high-contrast mode with customized dropdown option styling.
- **Light Purple / Light Blue**: Tinted accents for modern boutique branding.

---

## License

This project is licensed under the **ISC License**.

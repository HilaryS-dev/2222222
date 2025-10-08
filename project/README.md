# Restaurant Management App

A full-stack restaurant management platform with customer ordering, restaurant management, delivery tracking, and admin oversight.

## Features

### Customer
- Browse restaurants and menus
- Add items to cart
- Place orders (delivery, pickup, dine-in)
- Authentication required for checkout

### Restaurant Manager
- Manage menu items (add, edit, delete)
- View and update order status
- Track orders in real-time

### Delivery Personnel
- Set availability status
- View assigned deliveries
- Update delivery status

### System Admin
- View all users
- Manage restaurants
- View platform analytics

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: PHP
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites
- Node.js
- PHP 7.4+
- Supabase account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the PHP backend server:
```bash
./start-php-server.sh
```

3. In a new terminal, start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Schema

The database includes tables for:
- Users (with different roles)
- Restaurants
- Menu items
- Orders and order items
- Cart and cart items
- Deliveries
- Tables and reservations
- Payments

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Color Theme

The app uses an orange and green color scheme throughout the interface.

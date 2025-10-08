# Restaurant App Setup Guide

## Quick Start

### 1. Start the PHP Backend Server

In a terminal, run:
```bash
./start-php-server.sh
```

This will start the PHP server on `http://localhost:8000`

### 2. Start the React Development Server

In another terminal, run:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Testing the Application

### Creating Test Accounts

1. **Customer Account**:
   - Click "Sign Up"
   - Fill in your details
   - Select "Customer" as user type
   - After signup, you'll be logged in automatically

2. **Delivery Agent Account**:
   - Click "Sign Up"
   - Fill in your details
   - Select "Delivery Agent" as user type
   - After signup, you'll see the delivery dashboard

### Customer Features

1. **Browse Restaurants**: You'll see 3 sample restaurants on the homepage
2. **View Menu**: Click on any restaurant to see their menu
3. **Add to Cart**: Click "Add to Cart" on menu items
4. **View Cart**: Click the cart icon in the top navigation
5. **Place Order**:
   - Choose order type (Delivery, Pickup, or Dine-in)
   - For delivery, enter your address
   - Click "Place Order"

### Restaurant Manager Features

To test manager features, you'll need to:
1. Create a manager account in the database manually
2. Link them to a restaurant in the `restaurant_managers` table

### Delivery Personnel Features

1. **Set Availability**: Toggle online/offline status
2. **View Deliveries**: See assigned delivery orders
3. **Update Status**: Mark deliveries as picked up, in transit, or delivered

### Admin Features

To test admin features, you'll need to:
1. Create an admin account in the database manually
2. Add them to the `admins` table

## Sample Data

The database includes:
- 3 restaurants (The Green Kitchen, Orange Bistro, Fusion Delight)
- Menu items for each restaurant
- Tables for each restaurant

## Troubleshooting

### PHP Server Issues
- Make sure PHP is installed: `php --version`
- Check if port 8000 is available
- Check the terminal for PHP error messages

### Database Connection Issues
- Verify your Supabase credentials in `.env`
- Check that the database migrations ran successfully
- Ensure RLS policies are properly configured

### CORS Issues
- Make sure the PHP server is running
- Check that Vite proxy is configured correctly in `vite.config.ts`

## Color Theme

The app uses an orange and green color scheme:
- Primary: Orange (#F97316)
- Secondary: Green (#22C55E)
- Gradients are used throughout for buttons and headers

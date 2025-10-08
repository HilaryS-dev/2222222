# Quick Start Guide

## Prerequisites
- MySQL server running
- `smartbite` database already created
- PHP 7.4+ installed
- Node.js installed

## Step 1: Setup Database

Run the database setup script:

```bash
mysql -u root -p smartbite < database_setup.sql
```

This creates:
- `user_sessions` table for authentication
- Default admin user (admin@smartbite.com / admin123)

## Step 2: Test the Admin Login

1. Start the dev server (if not already running)
2. Open the application in your browser
3. Login with:
   - **Email**: admin@smartbite.com
   - **Password**: admin123

## Step 3: Create Your First Restaurant

1. After logging in as admin, you'll see the Admin Dashboard
2. Click "Add Restaurant" button
3. Fill in:
   - Restaurant Name (e.g., "Pizza Palace")
   - Address (e.g., "123 Main St")
   - Contact Info (e.g., "555-1234")
   - Location (optional)
4. Click "Create Restaurant"

## Step 4: Create a Restaurant Manager

1. Go to the "Managers" tab
2. Click "Add Manager" button
3. Fill in:
   - Name (e.g., "John Smith")
   - Email (e.g., "john@pizzapalace.com")
   - Password (e.g., "manager123")
   - Phone Number (optional)
   - Select the restaurant you just created
4. Click "Create Manager"
5. You'll see a success message

## Step 5: Test Manager Login

1. Logout from admin account
2. Login with the manager credentials:
   - Email: john@pizzapalace.com
   - Password: manager123
3. You should see the Manager Dashboard
4. Manager can now:
   - Add menu items
   - Manage orders
   - Update restaurant info

## Workflow Summary

```
Admin Login
    ↓
Create Restaurant
    ↓
Create Manager + Assign to Restaurant
    ↓
Manager Login
    ↓
Manager Manages Restaurant
```

## Default Credentials

**Admin:**
- Email: admin@smartbite.com
- Password: admin123

**Change this password immediately after first login!**

## Troubleshooting

### Database Connection Error
- Check `api/config.php`
- Verify MySQL credentials (default: root with no password)
- Ensure `smartbite` database exists

### Admin Login Fails
- Run the `database_setup.sql` script
- Check if admin user exists in `user` table
- Check if admin_id exists in `admin` table

### Manager Can't Login
- Verify manager was created successfully
- Check if user exists in `user` table
- Check if manager_id exists in `restaurant_manager` table

## Important Notes

1. **Password Security**: Change the default admin password immediately
2. **Database Credentials**: Update MySQL credentials in `api/config.php` if needed
3. **Token Expiration**: Sessions expire after 7 days
4. **Role Assignment**: Only admin can create managers and assign them to restaurants

## Need Help?

Check the `IMPLEMENTATION_SUMMARY.md` file for detailed technical documentation.

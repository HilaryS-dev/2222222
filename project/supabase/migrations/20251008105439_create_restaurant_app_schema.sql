/*
  # Restaurant App Database Schema

  ## Overview
  Creates complete database schema for a multi-user restaurant management platform
  supporting customers, restaurant managers, delivery personnel, and system admins.

  ## New Tables Created

  ### 1. User (extends auth.users)
  - `user_id` (uuid, FK to auth.users)
  - `name` (text)
  - `phone_number` (text)
  - `email` (text)
  - `password` (text) - Note: password stored in auth.users
  
  ### 2. Customer
  - `customer_id` (uuid, PK)
  - Inherits from User table

  ### 3. Restaurant
  - `restaurant_id` (uuid, PK)
  - `restaurant_name` (text)
  - `address` (text)
  - `contact_number` (text)
  - `location` (text)
  - `status` (text)

  ### 4. Restaurant_Manager
  - `manager_id` (uuid, PK)
  - `restaurant_id` (uuid, FK)
  - Inherits from User

  ### 5. Restaurant_Staff
  - `staff_id` (uuid, PK)
  - `restaurant_id` (uuid, FK)
  - `role` (text)
  - `salary` (float)
  - `shift_date` (date)
  - `status` (text)

  ### 6. Delivery_Agent
  - `agent_id` (uuid, PK)
  - `is_available` (boolean)
  - Inherits from User

  ### 7. Admin
  - `admin_id` (uuid, PK)
  - Inherits from User

  ### 8. Menu_Item
  - `menu_id` (uuid, PK)
  - `restaurant_id` (uuid, FK)
  - `item_name` (text)
  - `item_description` (text)
  - `price` (float)
  - `availability` (boolean)

  ### 9. Table
  - `table_id` (uuid, PK)
  - `restaurant_id` (uuid, FK)
  - `table_number` (int)
  - `capacity` (int)
  - `status` (text)

  ### 10. Reservation
  - `reservation_id` (uuid, PK)
  - `customer_id` (uuid, FK)
  - `table_id` (uuid, FK)
  - `reservation_date` (timestamptz)
  - `party_size` (int)
  - `status` (text)

  ### 11. Order
  - `order_id` (uuid, PK)
  - `customer_id` (uuid, FK)
  - `restaurant_id` (uuid, FK)
  - `order_date` (timestamptz)
  - `order_status` (text)
  - `order_type` (text) - delivery/dine-in/pickup
  - `delivery_address` (text)

  ### 12. Order_Item
  - `order_item_id` (uuid, PK)
  - `order_id` (uuid, FK)
  - `menu_id` (uuid, FK)
  - `item_quantity` (int)
  - `item_price` (float)

  ### 13. Cart
  - `cart_id` (uuid, PK)
  - `customer_id` (uuid, FK)
  - `total_amount` (float)

  ### 14. Cart_Item
  - `cart_item_id` (uuid, PK)
  - `cart_id` (uuid, FK)
  - `menu_id` (uuid, FK)
  - `quantity` (int)

  ### 15. Payment
  - `payment_id` (uuid, PK)
  - `order_id` (uuid, FK)
  - `payment_method` (text)
  - `item_quantity` (int)
  - `item_price` (float)

  ### 16. Delivery
  - `delivery_id` (uuid, PK)
  - `order_id` (uuid, FK)
  - `delivery_agent_id` (uuid, FK)
  - `pickup_location` (text)
  - `status` (text)
  - `estimated_time` (timestamptz)
  - `delivered_time` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for each user role
*/

-- Create base user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text,
  email text UNIQUE NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('customer', 'manager', 'staff', 'delivery', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Create Restaurant table
CREATE TABLE IF NOT EXISTS restaurants (
  restaurant_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name text NOT NULL,
  address text NOT NULL,
  contact_number text NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- Create Customer table
CREATE TABLE IF NOT EXISTS customers (
  customer_id uuid PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create Restaurant Manager table
CREATE TABLE IF NOT EXISTS restaurant_managers (
  manager_id uuid PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create Restaurant Staff table
CREATE TABLE IF NOT EXISTS restaurant_staff (
  staff_id uuid PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  role text NOT NULL,
  salary float,
  shift_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- Create Delivery Agent table
CREATE TABLE IF NOT EXISTS delivery_agents (
  agent_id uuid PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  is_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create Admin table
CREATE TABLE IF NOT EXISTS admins (
  admin_id uuid PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create Menu Item table
CREATE TABLE IF NOT EXISTS menu_items (
  menu_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_description text,
  price float NOT NULL CHECK (price >= 0),
  availability boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create Table table
CREATE TABLE IF NOT EXISTS tables (
  table_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  table_number int NOT NULL,
  capacity int NOT NULL CHECK (capacity > 0),
  status text DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

-- Create Reservation table
CREATE TABLE IF NOT EXISTS reservations (
  reservation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE,
  table_id uuid REFERENCES tables(table_id) ON DELETE CASCADE,
  reservation_date timestamptz NOT NULL,
  party_size int NOT NULL CHECK (party_size > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create Order table
CREATE TABLE IF NOT EXISTS orders (
  order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  order_date timestamptz DEFAULT now(),
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  order_type text NOT NULL CHECK (order_type IN ('delivery', 'dine-in', 'pickup')),
  delivery_address text,
  created_at timestamptz DEFAULT now()
);

-- Create Order Item table
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(order_id) ON DELETE CASCADE,
  menu_id uuid REFERENCES menu_items(menu_id) ON DELETE CASCADE,
  item_quantity int NOT NULL CHECK (item_quantity > 0),
  item_price float NOT NULL CHECK (item_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create Cart table
CREATE TABLE IF NOT EXISTS carts (
  cart_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE,
  total_amount float DEFAULT 0 CHECK (total_amount >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id)
);

-- Create Cart Item table
CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(cart_id) ON DELETE CASCADE,
  menu_id uuid REFERENCES menu_items(menu_id) ON DELETE CASCADE,
  quantity int NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(cart_id, menu_id)
);

-- Create Payment table
CREATE TABLE IF NOT EXISTS payments (
  payment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(order_id) ON DELETE CASCADE,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'online')),
  item_quantity int NOT NULL,
  item_price float NOT NULL CHECK (item_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create Delivery table
CREATE TABLE IF NOT EXISTS deliveries (
  delivery_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(order_id) ON DELETE CASCADE,
  delivery_agent_id uuid REFERENCES delivery_agents(agent_id) ON DELETE SET NULL,
  pickup_location text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  estimated_time timestamptz,
  delivered_time timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can create profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for restaurants (public read, managers can manage their own)
CREATE POLICY "Anyone can view active restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Managers can update their restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_managers WHERE manager_id = auth.uid()
    )
  );

-- RLS Policies for customers
CREATE POLICY "Users can view own customer profile"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create customer profile"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- RLS Policies for restaurant_managers
CREATE POLICY "Managers can view own profile"
  ON restaurant_managers FOR SELECT
  TO authenticated
  USING (auth.uid() = manager_id);

-- RLS Policies for delivery_agents
CREATE POLICY "Agents can view own profile"
  ON delivery_agents FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can update own profile"
  ON delivery_agents FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Users can create delivery agent profile"
  ON delivery_agents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (availability = true);

CREATE POLICY "Managers can manage their menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_managers WHERE manager_id = auth.uid()
    )
  );

-- RLS Policies for tables
CREATE POLICY "Anyone can view available tables"
  ON tables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can manage their tables"
  ON tables FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_managers WHERE manager_id = auth.uid()
    )
  );

-- RLS Policies for reservations
CREATE POLICY "Customers can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tables t
      JOIN restaurant_managers rm ON t.restaurant_id = rm.restaurant_id
      WHERE t.table_id = reservations.table_id AND rm.manager_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers and managers can update reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tables t
      JOIN restaurant_managers rm ON t.restaurant_id = rm.restaurant_id
      WHERE t.table_id = reservations.table_id AND rm.manager_id = auth.uid()
    )
  );

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM restaurant_managers WHERE restaurant_id = orders.restaurant_id AND manager_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Managers can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_managers WHERE restaurant_id = orders.restaurant_id AND manager_id = auth.uid()
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.order_id = order_items.order_id 
      AND (customer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM restaurant_managers WHERE restaurant_id = orders.restaurant_id AND manager_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.order_id = order_items.order_id AND customer_id = auth.uid()
    )
  );

-- RLS Policies for carts
CREATE POLICY "Customers can view own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can manage own cart"
  ON carts FOR ALL
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- RLS Policies for cart_items
CREATE POLICY "Customers can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts WHERE carts.cart_id = cart_items.cart_id AND customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can manage own cart items"
  ON cart_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts WHERE carts.cart_id = cart_items.cart_id AND customer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts WHERE carts.cart_id = cart_items.cart_id AND customer_id = auth.uid()
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view payments for their orders"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.order_id = payments.order_id AND customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.order_id = payments.order_id AND customer_id = auth.uid()
    )
  );

-- RLS Policies for deliveries
CREATE POLICY "Users can view relevant deliveries"
  ON deliveries FOR SELECT
  TO authenticated
  USING (
    delivery_agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM orders WHERE orders.order_id = deliveries.order_id 
      AND (customer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM restaurant_managers WHERE restaurant_id = orders.restaurant_id AND manager_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Managers can assign deliveries"
  ON deliveries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN restaurant_managers ON orders.restaurant_id = restaurant_managers.restaurant_id
      WHERE orders.order_id = deliveries.order_id AND restaurant_managers.manager_id = auth.uid()
    )
  );

CREATE POLICY "Agents and managers can update deliveries"
  ON deliveries FOR UPDATE
  TO authenticated
  USING (
    delivery_agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM orders 
      JOIN restaurant_managers ON orders.restaurant_id = restaurant_managers.restaurant_id
      WHERE orders.order_id = deliveries.order_id AND restaurant_managers.manager_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_availability ON menu_items(availability);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_agent ON deliveries(delivery_agent_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

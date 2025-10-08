/*
  # Add Sample Data

  ## Overview
  Adds sample data for testing the restaurant app including restaurants, menu items, and test users.

  ## Sample Data Added
  - 3 sample restaurants
  - Menu items for each restaurant
  - Tables for restaurants
*/

-- Insert sample restaurants
INSERT INTO restaurants (restaurant_name, address, contact_number, location, status)
VALUES
  ('The Green Kitchen', '123 Main St, Downtown', '+1-555-0101', 'Downtown Area', 'active'),
  ('Orange Bistro', '456 Oak Ave, Midtown', '+1-555-0102', 'Midtown District', 'active'),
  ('Fusion Delight', '789 Pine Rd, Uptown', '+1-555-0103', 'Uptown Square', 'active')
ON CONFLICT DO NOTHING;

-- Get restaurant IDs
DO $$
DECLARE
  green_kitchen_id uuid;
  orange_bistro_id uuid;
  fusion_delight_id uuid;
BEGIN
  SELECT restaurant_id INTO green_kitchen_id FROM restaurants WHERE restaurant_name = 'The Green Kitchen';
  SELECT restaurant_id INTO orange_bistro_id FROM restaurants WHERE restaurant_name = 'Orange Bistro';
  SELECT restaurant_id INTO fusion_delight_id FROM restaurants WHERE restaurant_name = 'Fusion Delight';

  -- Insert menu items for The Green Kitchen
  INSERT INTO menu_items (restaurant_id, item_name, item_description, price, availability)
  VALUES
    (green_kitchen_id, 'Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 12.99, true),
    (green_kitchen_id, 'Grilled Chicken', 'Herb-marinated grilled chicken breast', 18.99, true),
    (green_kitchen_id, 'Vegetable Pasta', 'Penne pasta with seasonal vegetables', 15.99, true),
    (green_kitchen_id, 'Green Smoothie', 'Spinach, banana, and mango smoothie', 7.99, true)
  ON CONFLICT DO NOTHING;

  -- Insert menu items for Orange Bistro
  INSERT INTO menu_items (restaurant_id, item_name, item_description, price, availability)
  VALUES
    (orange_bistro_id, 'Margherita Pizza', 'Classic pizza with fresh mozzarella and basil', 16.99, true),
    (orange_bistro_id, 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 17.99, true),
    (orange_bistro_id, 'Tiramisu', 'Classic Italian dessert', 8.99, true),
    (orange_bistro_id, 'Bruschetta', 'Toasted bread with tomatoes and garlic', 9.99, true)
  ON CONFLICT DO NOTHING;

  -- Insert menu items for Fusion Delight
  INSERT INTO menu_items (restaurant_id, item_name, item_description, price, availability)
  VALUES
    (fusion_delight_id, 'Sushi Platter', 'Assorted sushi rolls with wasabi and ginger', 24.99, true),
    (fusion_delight_id, 'Pad Thai', 'Thai stir-fried noodles with peanuts', 14.99, true),
    (fusion_delight_id, 'Ramen Bowl', 'Japanese noodle soup with pork and egg', 16.99, true),
    (fusion_delight_id, 'Spring Rolls', 'Fresh vegetable spring rolls with dipping sauce', 8.99, true)
  ON CONFLICT DO NOTHING;

  -- Insert tables for restaurants
  INSERT INTO tables (restaurant_id, table_number, capacity, status)
  VALUES
    (green_kitchen_id, 1, 2, 'available'),
    (green_kitchen_id, 2, 4, 'available'),
    (green_kitchen_id, 3, 6, 'available'),
    (orange_bistro_id, 1, 2, 'available'),
    (orange_bistro_id, 2, 4, 'available'),
    (orange_bistro_id, 3, 8, 'available'),
    (fusion_delight_id, 1, 2, 'available'),
    (fusion_delight_id, 2, 4, 'available'),
    (fusion_delight_id, 3, 6, 'available')
  ON CONFLICT DO NOTHING;
END $$;

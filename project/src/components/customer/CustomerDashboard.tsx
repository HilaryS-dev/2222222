import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { ShoppingCart, Store, Package, LogOut } from 'lucide-react';

interface Restaurant {
  restaurant_id: string;
  restaurant_name: string;
  address: string;
  location: string;
}

interface MenuItem {
  menu_id: string;
  item_name: string;
  item_description: string;
  price: number;
}

interface CartItem {
  cart_item_id: string;
  menu_id: string;
  quantity: number;
  item_name: string;
  price: number;
  subtotal: number;
}

export const CustomerDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'dine-in' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRestaurants();
    loadCart();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await api.restaurants.getAll(token!);
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants', error);
    }
  };

  const loadMenu = async (restaurantId: string) => {
    try {
      const data = await api.menu.getByRestaurant(restaurantId, token!);
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to load menu', error);
    }
  };

  const loadCart = async () => {
    try {
      const data = await api.cart.get(user!.id, token!);
      setCart(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load cart', error);
    }
  };

  const selectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    loadMenu(restaurant.restaurant_id);
  };

  const addToCart = async (item: MenuItem) => {
    try {
      await api.cart.add(
        {
          customer_id: user!.id,
          menu_id: item.menu_id,
          quantity: 1,
        },
        token!
      );
      await loadCart();
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    try {
      await api.cart.update({ cart_item_id: cartItemId, quantity }, token!);
      await loadCart();
    } catch (error) {
      alert('Failed to update cart');
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      alert('Please enter delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_id: user!.id,
        restaurant_id: selectedRestaurant!.restaurant_id,
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? deliveryAddress : null,
        items: cart.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          price: item.price,
        })),
        pickup_location: selectedRestaurant!.address,
      };

      await api.orders.create(orderData, token!);
      await api.cart.clear(user!.id, token!);
      await loadCart();
      setShowCart(false);
      alert('Order placed successfully!');
    } catch (error) {
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            FoodHub
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 hover:bg-gray-100 rounded-full"
            >
              <ShoppingCart className="w-6 h-6 text-orange-600" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {!selectedRestaurant ? (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Browse Restaurants</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.restaurant_id}
                  onClick={() => selectRestaurant(restaurant)}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-green-400 rounded-full flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{restaurant.restaurant_name}</h3>
                  </div>
                  <p className="text-gray-600 mb-2">{restaurant.address}</p>
                  <p className="text-sm text-gray-500">{restaurant.location}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="mb-6 text-orange-600 hover:text-orange-700 font-semibold"
            >
              ← Back to Restaurants
            </button>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">{selectedRestaurant.restaurant_name}</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div key={item.menu_id} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.item_name}</h3>
                  <p className="text-gray-600 mb-4">{item.item_description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">${item.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h2>

            {cart.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.cart_item_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.item_name}</h3>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateCartItem(item.cart_item_id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-300 rounded-full hover:bg-gray-400"
                        >
                          -
                        </button>
                        <span className="font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item.cart_item_id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-300 rounded-full hover:bg-gray-400"
                        >
                          +
                        </button>
                        <span className="ml-4 font-bold text-green-600">${item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">${cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="delivery">Delivery</option>
                      <option value="pickup">Pickup</option>
                      <option value="dine-in">Dine In</option>
                    </select>
                  </div>

                  {orderType === 'delivery' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter your address"
                      />
                    </div>
                  )}

                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setShowCart(false)}
              className="w-full mt-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

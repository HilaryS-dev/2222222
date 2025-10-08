import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { LogOut, Plus, Edit, Trash2, Package, Users } from 'lucide-react';

interface MenuItem {
  menu_id: string;
  item_name: string;
  item_description: string;
  price: number;
  availability: boolean;
}

interface Order {
  order_id: string;
  order_date: string;
  order_status: string;
  order_type: string;
  delivery_address?: string;
}

export const ManagerDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    item_name: '',
    item_description: '',
    price: 0,
    availability: true,
  });

  useEffect(() => {
    loadRestaurantId();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      loadMenu();
      loadOrders();
    }
  }, [restaurantId]);

  const loadRestaurantId = async () => {
    setRestaurantId('1');
  };

  const loadMenu = async () => {
    try {
      const data = await api.menu.getByRestaurant(restaurantId, token!);
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to load menu', error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.orders.getByRestaurant(restaurantId, token!);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders', error);
    }
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.menu.create({ ...menuForm, restaurant_id: restaurantId }, token!);
      await loadMenu();
      setShowAddMenu(false);
      setMenuForm({ item_name: '', item_description: '', price: 0, availability: true });
    } catch (error) {
      alert('Failed to add menu item');
    }
  };

  const handleUpdateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await api.menu.update(editingItem.menu_id, menuForm, token!);
      await loadMenu();
      setEditingItem(null);
      setMenuForm({ item_name: '', item_description: '', price: 0, availability: true });
    } catch (error) {
      alert('Failed to update menu item');
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.menu.delete(menuId, token!);
      await loadMenu();
    } catch (error) {
      alert('Failed to delete menu item');
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      item_name: item.item_name,
      item_description: item.item_description,
      price: item.price,
      availability: item.availability,
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.orders.updateStatus(orderId, status, token!);
      await loadOrders();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            Manager Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
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
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              activeTab === 'menu'
                ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            Menu Management
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            Order Management
          </button>
        </div>

        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Menu Items</h2>
              <button
                onClick={() => setShowAddMenu(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div key={item.menu_id} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.item_name}</h3>
                  <p className="text-gray-600 mb-4">{item.item_description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-green-600">${item.price.toFixed(2)}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        item.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(item.menu_id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.order_id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order ID: {order.order_id}</p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(order.order_date).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Type: {order.order_type}</p>
                      {order.delivery_address && (
                        <p className="text-sm text-gray-500">Address: {order.delivery_address}</p>
                      )}
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        order.order_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.order_status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(order.order_id, 'confirmed')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.order_id, 'preparing')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Preparing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.order_id, 'ready')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Ready
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.order_id, 'completed')}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(showAddMenu || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>

            <form onSubmit={editingItem ? handleUpdateMenu : handleAddMenu} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={menuForm.item_name}
                  onChange={(e) => setMenuForm({ ...menuForm, item_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={menuForm.item_description}
                  onChange={(e) => setMenuForm({ ...menuForm, item_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={menuForm.availability}
                  onChange={(e) => setMenuForm({ ...menuForm, availability: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Available</label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-green-500 text-white py-2 rounded-lg hover:from-orange-600 hover:to-green-600"
                >
                  {editingItem ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    setEditingItem(null);
                    setMenuForm({ item_name: '', item_description: '', price: 0, availability: true });
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

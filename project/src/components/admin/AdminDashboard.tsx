import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Building2, UserPlus, Users, LogOut, Plus } from 'lucide-react';

interface Restaurant {
  restaurant_id: number;
  restaurant_name: string;
  address: string;
  contact_info: string;
  location: string;
  status: string;
  manager_name?: string;
  manager_email?: string;
}

interface Manager {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  restaurant_name?: string;
}

export const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'managers'>('restaurants');
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState({
    restaurant_name: '',
    address: '',
    contact_info: '',
    location: '',
  });

  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    restaurant_id: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (!token) return;

    try {
      if (activeTab === 'restaurants') {
        const result = await api.admin.getRestaurants(token);
        setRestaurants(result.restaurants || []);
      } else {
        const result = await api.admin.getManagers(token);
        setManagers(result.managers || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const result = await api.admin.createRestaurant(restaurantForm, token);
      if (result.success) {
        alert('Restaurant created successfully!');
        setRestaurantForm({
          restaurant_name: '',
          address: '',
          contact_info: '',
          location: '',
        });
        setShowRestaurantForm(false);
        loadData();
      } else {
        alert(result.error || 'Failed to create restaurant');
      }
    } catch (error) {
      alert('Failed to create restaurant');
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const result = await api.admin.createManager(managerForm, token);
      if (result.success) {
        alert('Manager created successfully! They can now log in with their credentials.');
        setManagerForm({
          name: '',
          email: '',
          password: '',
          phone_number: '',
          restaurant_id: '',
        });
        setShowManagerForm(false);
        loadData();
      } else {
        alert(result.error || 'Failed to create manager');
      }
    } catch (error) {
      alert('Failed to create manager');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Welcome, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex gap-4 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'restaurants'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-5 h-5" />
              Restaurants
            </button>
            <button
              onClick={() => setActiveTab('managers')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'managers'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-5 h-5" />
              Managers
            </button>
          </div>
        </div>

        {activeTab === 'restaurants' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Restaurants</h2>
              <button
                onClick={() => setShowRestaurantForm(!showRestaurantForm)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Restaurant
              </button>
            </div>

            {showRestaurantForm && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Restaurant</h3>
                <form onSubmit={handleCreateRestaurant} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantForm.restaurant_name}
                      onChange={(e) =>
                        setRestaurantForm({ ...restaurantForm, restaurant_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantForm.address}
                      onChange={(e) =>
                        setRestaurantForm({ ...restaurantForm, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contact Info
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantForm.contact_info}
                      onChange={(e) =>
                        setRestaurantForm({ ...restaurantForm, contact_info: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={restaurantForm.location}
                      onChange={(e) =>
                        setRestaurantForm({ ...restaurantForm, location: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Create Restaurant
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRestaurantForm(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid gap-4">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.restaurant_id}
                  className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {restaurant.restaurant_name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{restaurant.address}</p>
                      <p className="text-sm text-slate-600">{restaurant.contact_info}</p>
                      {restaurant.location && (
                        <p className="text-sm text-slate-600">{restaurant.location}</p>
                      )}
                      {restaurant.manager_name && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-sm font-medium text-slate-700">Manager</p>
                          <p className="text-sm text-slate-600">{restaurant.manager_name}</p>
                          <p className="text-sm text-slate-600">{restaurant.manager_email}</p>
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        restaurant.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {restaurant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'managers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Managers</h2>
              <button
                onClick={() => setShowManagerForm(!showManagerForm)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Manager
              </button>
            </div>

            {showManagerForm && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Manager</h3>
                <form onSubmit={handleCreateManager} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={managerForm.name}
                      onChange={(e) => setManagerForm({ ...managerForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={managerForm.email}
                      onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={managerForm.password}
                      onChange={(e) =>
                        setManagerForm({ ...managerForm, password: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={managerForm.phone_number}
                      onChange={(e) =>
                        setManagerForm({ ...managerForm, phone_number: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Assign to Restaurant
                    </label>
                    <select
                      required
                      value={managerForm.restaurant_id}
                      onChange={(e) =>
                        setManagerForm({ ...managerForm, restaurant_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    >
                      <option value="">Select a restaurant</option>
                      {restaurants.map((r) => (
                        <option key={r.restaurant_id} value={r.restaurant_id}>
                          {r.restaurant_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Create Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManagerForm(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid gap-4">
              {managers.map((manager) => (
                <div
                  key={manager.user_id}
                  className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{manager.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{manager.email}</p>
                  <p className="text-sm text-slate-600">{manager.phone_number}</p>
                  {manager.restaurant_name && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-700">Assigned Restaurant</p>
                      <p className="text-sm text-slate-600">{manager.restaurant_name}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

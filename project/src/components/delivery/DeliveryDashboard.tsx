import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { LogOut, Package, CheckCircle, XCircle } from 'lucide-react';

interface Delivery {
  delivery_id: string;
  order_id: string;
  pickup_location: string;
  status: string;
  estimated_time?: string;
}

export const DeliveryDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    loadAvailability();
    loadDeliveries();
  }, []);

  const loadAvailability = async () => {
    setIsAvailable(false);
  };

  const loadDeliveries = async () => {
    try {
      const data = await api.delivery.getByAgent(user!.id, token!);
      setDeliveries(data);
    } catch (error) {
      console.error('Failed to load deliveries', error);
    }
  };

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
  };

  const updateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      await api.delivery.updateStatus(deliveryId, status, token!);
      await loadDeliveries();
    } catch (error) {
      alert('Failed to update delivery status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            Delivery Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-lg font-semibold ${
                isAvailable
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {isAvailable ? 'Online' : 'Offline'}
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Deliveries</h2>

        {deliveries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No deliveries assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div key={delivery.delivery_id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Delivery ID: {delivery.delivery_id}</p>
                    <p className="text-sm text-gray-500">Order ID: {delivery.order_id}</p>
                    <p className="font-semibold text-gray-800 mt-2">
                      Pickup: {delivery.pickup_location}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      delivery.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : delivery.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {delivery.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {delivery.status === 'assigned' && (
                    <>
                      <button
                        onClick={() => updateDeliveryStatus(delivery.delivery_id, 'picked_up')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Mark Picked Up
                      </button>
                    </>
                  )}
                  {delivery.status === 'picked_up' && (
                    <button
                      onClick={() => updateDeliveryStatus(delivery.delivery_id, 'in_transit')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      In Transit
                    </button>
                  )}
                  {delivery.status === 'in_transit' && (
                    <button
                      onClick={() => updateDeliveryStatus(delivery.delivery_id, 'delivered')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

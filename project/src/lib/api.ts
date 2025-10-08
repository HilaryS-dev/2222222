const API_BASE = '/api';

export const api = {
  auth: {
    signup: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth.php?action=signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    login: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
  admin: {
    getRestaurants: async (token: string) => {
      const res = await fetch(`${API_BASE}/admin.php?action=restaurants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    getManagers: async (token: string) => {
      const res = await fetch(`${API_BASE}/admin.php?action=managers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    getUsers: async (token: string) => {
      const res = await fetch(`${API_BASE}/admin.php?action=users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    createRestaurant: async (data: any, token: string) => {
      const res = await fetch(`${API_BASE}/admin.php?action=create_restaurant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    createManager: async (data: any, token: string) => {
      const res = await fetch(`${API_BASE}/admin.php?action=create_manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    updateRestaurant: async (id: string, data: any, token: string) => {
      const res = await fetch(`${API_BASE}/admin.php?action=update_restaurant&id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    deleteRestaurant: async (id: string, token: string) => {
      const res = await fetch(`${API_BASE}/admin.php?action=delete_restaurant&id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  },
  restaurants: {
    getAll: async (token: string) => {
      const res = await fetch(`${API_BASE}/restaurants.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  },
  menu: {
    getByRestaurant: async (restaurantId: string, token: string) => {
      const res = await fetch(`${API_BASE}/menu.php?restaurant_id=${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    create: async (data: any, token: string) => {
      const res = await fetch(`${API_BASE}/menu.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: any, token: string) => {
      const res = await fetch(`${API_BASE}/menu.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string, token: string) => {
      const res = await fetch(`${API_BASE}/menu.php?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  },
  cart: {
    get: async (customerId: string, token: string) => {
      const res = await fetch(`${API_BASE}/cart.php?customer_id=${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    add: async (data: any, token: string) => {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (data: any, token: string) => {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    clear: async (customerId: string, token: string) => {
      const res = await fetch(`${API_BASE}/cart.php?customer_id=${customerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  },
  orders: {
    create: async (data: any, token: string) => {
      const res = await fetch(`${API_BASE}/orders.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getByCustomer: async (customerId: string, token: string) => {
      const res = await fetch(`${API_BASE}/orders.php?customer_id=${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    getByRestaurant: async (restaurantId: string, token: string) => {
      const res = await fetch(`${API_BASE}/orders.php?restaurant_id=${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    updateStatus: async (id: string, status: string, token: string) => {
      const res = await fetch(`${API_BASE}/orders.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_status: status }),
      });
      return res.json();
    },
  },
  delivery: {
    getByAgent: async (agentId: string, token: string) => {
      const res = await fetch(`${API_BASE}/delivery.php?agent_id=${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    updateStatus: async (id: string, status: string, token: string) => {
      const res = await fetch(`${API_BASE}/delivery.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    assign: async (data: any, token: string) => {
      const res = await fetch(`${API_BASE}/delivery.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
  tables: {
    getByRestaurant: async (restaurantId: string, token: string) => {
      const res = await fetch(`${API_BASE}/tables.php?restaurant_id=${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    update: async (id: string, data: any, token: string) => {
      const res = await fetch(`${API_BASE}/tables.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
};

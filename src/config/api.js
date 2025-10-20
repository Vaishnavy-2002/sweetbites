// API Configuration - Use relative URLs to leverage proxy
const API_BASE_URL = '';

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};

// Helper function to make authenticated requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };

  return fetch(url, config);
};

// API object with methods similar to axios
const api = {
  get: async (endpoint, config = {}) => {
    const response = await apiRequest(endpoint, { method: 'GET', ...config });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  },

  post: async (endpoint, data, config = {}) => {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...config
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return { data: responseData };
  },

  put: async (endpoint, data, config = {}) => {
    const response = await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...config
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return { data: responseData };
  },

  delete: async (endpoint, config = {}) => {
    const response = await apiRequest(endpoint, { method: 'DELETE', ...config });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  }
};

export default api;

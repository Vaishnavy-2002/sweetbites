import {
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  TrashIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';
import { useAuth } from '../contexts/AuthContext';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState({});

  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [isViewOnlyFeedback, setIsViewOnlyFeedback] = useState(false);

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  // Admin analytics
  const [adminStats, setAdminStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0
  });

  // Order status options
  const orderStatuses = [
    'all',
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ];

  // Function to format customization details
  const formatCustomizationDetails = (customizationNotes) => {
    if (!customizationNotes) return null;

    try {
      const customizations = JSON.parse(customizationNotes);
      const details = [];

      // Format each customization option
      if (customizations.size) details.push(`Size: ${customizations.size}`);
      if (customizations.shape) details.push(`Shape: ${customizations.shape}`);
      if (customizations.frosting) details.push(`Frosting: ${customizations.frosting}`);
      if (customizations.color) details.push(`Color: ${customizations.color}`);
      if (customizations.toppings && customizations.toppings.length > 0) {
        details.push(`Toppings: ${customizations.toppings.join(', ')}`);
      }
      if (customizations.message) details.push(`Message: "${customizations.message}"`);

      return details.length > 0 ? details : null;
    } catch (error) {
      console.error('Error parsing customization notes:', error);
      return null;
    }
  };


  // Apply filters to orders
  const applyFilters = useCallback(() => {
    let filtered = [...orders];

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.order_status === activeTab);
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm) ||
        order.customer_info?.display_name?.toLowerCase().includes(searchTerm) ||
        order.customer?.username?.toLowerCase().includes(searchTerm) ||
        order.customer?.email?.toLowerCase().includes(searchTerm) ||
        order.items?.some(item =>
          item.cake?.name?.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.order_status === filters.status);
    }

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(order =>
        new Date(order.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(order =>
        new Date(order.created_at) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    // Apply amount filters
    if (filters.minAmount) {
      filtered = filtered.filter(order =>
        parseFloat(order.total_amount) >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(order =>
        parseFloat(order.total_amount) <= parseFloat(filters.maxAmount)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filters, activeTab]);

  // Load orders from API
  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      console.log('🔄 Loading admin orders...');
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch orders and dashboard stats in parallel
      const [ordersResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:8000/api/orders/orders/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/api/orders/admin-dashboard/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('📡 Admin Orders API response status:', ordersResponse.status);
      console.log('📡 Admin Stats API response status:', statsResponse.status);

      if (ordersResponse.ok && statsResponse.ok) {
        const [ordersData, statsData] = await Promise.all([
          ordersResponse.json(),
          statsResponse.json()
        ]);

        console.log('📋 Admin Orders data received:', ordersData);
        console.log('📊 Admin Stats data received:', statsData);

        // Handle orders data format
        let ordersList = ordersData;
        if (ordersData && ordersData.results && Array.isArray(ordersData.results)) {
          ordersList = ordersData.results;
        } else if (ordersData && ordersData.data && Array.isArray(ordersData.data)) {
          ordersList = ordersData.data;
        } else if (ordersData && ordersData.orders && Array.isArray(ordersData.orders)) {
          ordersList = ordersData.orders;
        } else if (!Array.isArray(ordersData)) {
          console.error('API response is not in expected format:', ordersData);
          setOrders([]);
          setError('Invalid data format received from server. Expected array but got: ' + typeof ordersData);
          return;
        }

        console.log(`📊 Total admin orders from API: ${ordersList.length}`);

        // Update orders state
        setOrders(ordersList);

        // Update admin statistics from real backend data
        if (statsData && statsData.overview) {
          const overview = statsData.overview;
          const statusBreakdown = statsData.orders?.status_breakdown || {};

          setAdminStats({
            totalOrders: overview.total_orders || 0,
            totalRevenue: overview.total_revenue || 0,
            averageOrderValue: overview.total_orders > 0 ? (overview.total_revenue / overview.total_orders) : 0,
            completedOrders: statusBreakdown.delivered || 0,
            pendingOrders: overview.pending_orders || 0,
            cancelledOrders: statusBreakdown.cancelled || 0
          });

        }

        // Debug order items
        ordersList.forEach((order, index) => {
          console.log(`Admin Order ${index + 1}:`, {
            id: order.id,
            order_number: order.order_number,
            customer: order.customer_info?.display_name || order.customer?.email || order.customer?.username || 'Anonymous',
            items_count: order.items ? order.items.length : 0,
            items: order.items
          });
        });

        // Ensure each order has has_feedback field (default to false if not present)
        const processedOrders = ordersList.map(order => ({
          ...order,
          has_feedback: order.has_feedback || false
        }));

        setOrders(processedOrders);
        setError('');
        console.log(`✅ Loaded ${processedOrders.length} admin orders`);
      } else {
        const errorData = await ordersResponse.json();
        console.error('❌ Admin Orders API Error:', errorData);
        setError('Failed to load orders: ' + (errorData.detail || 'Unknown error'));
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error loading admin orders:', error);
      setError('Error loading orders: ' + error.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Delete order function
  const deleteOrder = async (orderId) => {
    try {
      setDeleting(true);
      console.log(`🗑️ Deleting order ${orderId}`);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/orders/orders/${orderId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`✅ Order ${orderId} deleted successfully`);

        // Remove order from local state
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        setFilteredOrders(prevFiltered => prevFiltered.filter(order => order.id !== orderId));

        // Close delete modal
        setShowDeleteModal(false);
        setOrderToDelete(null);

        // Refresh admin stats
        await loadOrders(true);

        alert('Order deleted successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      alert('Failed to delete order: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  // Update order status with real-time backend integration
  const updateOrderStatus = async (orderId) => {
    const statusUpdate = statusUpdates[orderId];
    if (!statusUpdate || !statusUpdate.status) {
      alert('Please select a status');
      return;
    }

    try {
      console.log(`🔄 Updating order ${orderId} status to ${statusUpdate.status}`);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/orders/orders/${orderId}/update_status/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusUpdate)
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        console.log(`✅ Order ${orderId} status updated successfully:`, updatedOrder);

        // Update local state immediately for better UX
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, order_status: statusUpdate.status, updated_at: new Date().toISOString() }
              : order
          )
        );

        // Update filtered orders as well
        setFilteredOrders(prevFiltered =>
          prevFiltered.map(order =>
            order.id === orderId
              ? { ...order, order_status: statusUpdate.status, updated_at: new Date().toISOString() }
              : order
          )
        );

        // Clear the status update for this order
        setStatusUpdates(prev => {
          const newUpdates = { ...prev };
          delete newUpdates[orderId];
          return newUpdates;
        });

        // Refresh admin stats to reflect the status change
        await loadOrders(true);

        alert('Order status updated successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Failed to update order status: ' + error.message);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    loadOrders();

    // Set up real-time updates every 15 seconds for better responsiveness
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing admin orders...');
      loadOrders(true);
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [loadOrders]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Status icon helper
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
      case 'preparing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'ready':
      case 'out_for_delivery':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading while checking authentication or loading orders
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadOrders}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Orders</h1>
              <p className="text-gray-600">Manage all orders and update shipping status</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => loadOrders(true)}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">RS {adminStats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">RS {adminStats.averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-3">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by number, customer, or items..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FunnelIcon className="h-5 w-5" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Statuses</option>
                        {orderStatuses.slice(1).map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={filters.minAmount}
                        onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-4 px-6 overflow-x-auto">
                  {orderStatuses.map((status) => {
                    const count = status === 'all'
                      ? adminStats.totalOrders
                      : status === 'pending'
                        ? adminStats.pendingOrders
                        : status === 'delivered'
                          ? adminStats.completedOrders
                          : status === 'cancelled'
                            ? adminStats.cancelledOrders
                            : orders.filter(order => order.order_status === status).length;

                    return (
                      <button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === status
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        {status === 'all' ? 'All Orders' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${count > 0
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                          }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {!Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <ShoppingBagIcon className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-gray-600">
                    {filters.search || filters.status || filters.dateFrom || filters.dateTo || filters.minAmount
                      ? 'No orders match your current filters.'
                      : 'There are no orders to display at the moment.'
                    }
                  </p>
                  {(filters.search || filters.status || filters.dateFrom || filters.dateTo || filters.minAmount) && (
                    <button
                      onClick={() => {
                        setFilters({
                          search: '',
                          status: '',
                          dateFrom: '',
                          dateTo: '',
                          minAmount: '',
                          maxAmount: ''
                        });
                        setActiveTab('all');
                      }}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                Array.isArray(filteredOrders) && filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                        <p className="text-sm text-gray-600">
                          Customer: {order.customer_info?.display_name || order.customer?.username || order.customer?.email || 'Anonymous'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">RS {order.total_amount}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                          {order.order_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      {getStatusIcon(order.order_status)}
                      <span className="text-sm text-gray-600">
                        {order.order_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-2 mb-4">
                      {Array.isArray(order.items) && order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.cake?.name || 'Unknown Item'}
                            {item.customization_notes && (
                              <div className="text-xs text-gray-500 mt-1">
                                {formatCustomizationDetails(item.customization_notes)?.map((detail, idx) => (
                                  <div key={idx}>{detail}</div>
                                ))}
                              </div>
                            )}
                          </span>
                          <span className="font-medium">RS {item.total_price}</span>
                        </div>
                      ))}
                      {Array.isArray(order.items) && order.items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    {/* Customer Information - Only show when order is selected */}
                    {selectedOrder?.id === order.id && (
                      <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
                        <h5 className="font-medium mb-2 text-blue-900">Customer Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-gray-700">
                              <span className="font-medium">Name:</span> {order.customer?.first_name || order.customer_info?.first_name || 'N/A'} {order.customer?.last_name || order.customer_info?.last_name || ''}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Email:</span> {order.customer?.email || order.customer_info?.email || order.guest_email || 'N/A'}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Username:</span> {order.customer?.username || order.customer_info?.username || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-700">
                              <span className="font-medium">Phone:</span> {order.shipping_address?.phone || order.guest_phone || order.customer?.phone_number || 'N/A'}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Customer ID:</span> {order.customer?.id || order.customer_info?.id || 'Guest'}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Account Type:</span> {order.customer?.user_type || order.customer_info?.is_registered ? 'Registered' : 'Guest'}
                            </p>
                          </div>
                        </div>
                        {order.customer?.date_joined && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Member since:</span> {new Date(order.customer.date_joined).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Shipping Address - Only show when order is selected */}
                    {selectedOrder?.id === order.id && order.shipping_address && (
                      <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                        <h5 className="font-medium mb-2">Shipping Address</h5>
                        <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                        <p className="text-gray-600">{order.shipping_address.address_line1}</p>
                        {order.shipping_address.address_line2 && (
                          <p className="text-gray-600">{order.shipping_address.address_line2}</p>
                        )}
                        <p className="text-gray-600">
                          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                        </p>
                        {order.shipping_address.phone && (
                          <p className="text-gray-600">
                            <span className="font-medium">Phone:</span> {order.shipping_address.phone}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Guest Order Information - Only show when order is selected */}
                    {selectedOrder?.id === order.id && order.is_guest_order && !order.shipping_address && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded text-sm">
                        <h5 className="font-medium mb-2 text-yellow-900">Guest Order Information</h5>
                        <p className="text-gray-700">
                          <span className="font-medium">Email:</span> {order.guest_email || 'N/A'}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Phone:</span> {order.guest_phone || 'N/A'}
                        </p>
                        <p className="text-gray-600 text-xs mt-2">
                          Note: This is a guest order. Customer information is limited.
                        </p>
                      </div>
                    )}

                    {/* Order Actions */}
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(selectedOrder?.id === order.id ? null : order);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {selectedOrder?.id === order.id ? 'Show Less' : 'Show Details'}
                      </button>

                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/order-confirmation/${order.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Order
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(order);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                        {order.order_status === 'out_for_delivery' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/track-order/${order.id}`);
                            }}
                            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                          >
                            <TruckIcon className="h-4 w-4 mr-1" />
                            Track
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Update Form - Only show when order is selected */}
                    {selectedOrder?.id === order.id && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Update Order Status</h4>
                        <div className="flex space-x-3">
                          <select
                            value={statusUpdates[order.id]?.status || ''}
                            onChange={(e) => setStatusUpdates(prev => ({
                              ...prev,
                              [order.id]: {
                                ...prev[order.id],
                                status: e.target.value
                              }
                            }))}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Status</option>
                            {orderStatuses.slice(1).map((status) => (
                              <option key={status} value={status}>
                                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Notes (optional)"
                            value={statusUpdates[order.id]?.notes || ''}
                            onChange={(e) => setStatusUpdates(prev => ({
                              ...prev,
                              [order.id]: {
                                ...prev[order.id],
                                notes: e.target.value
                              }
                            }))}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => updateOrderStatus(order.id)}
                            disabled={!statusUpdates[order.id]?.status}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusUpdates[order.id]?.status
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Status Timeline - Only show when order is selected */}
                    {selectedOrder?.id === order.id && Array.isArray(order.status_history) && order.status_history.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Order Timeline</h5>
                        <div className="space-y-2">
                          {order.status_history.map((status) => (
                            <div key={status.id} className="flex items-start space-x-3 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="font-medium">{status.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                <p className="text-xs text-gray-500">{formatDate(status.created_at)}</p>
                                {status.notes && (
                                  <p className="text-xs text-gray-600 mt-1">{status.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Admin Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Admin Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-medium">{adminStats.totalOrders}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{adminStats.completedOrders}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium">{adminStats.pendingOrders}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Cancelled</span>
                  <span className="font-medium">{adminStats.cancelledOrders}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-medium">RS {adminStats.totalRevenue.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedOrderForFeedback(null);
            setExistingFeedback(null);
            setIsEditingFeedback(false);
            setIsViewOnlyFeedback(false);
          }}
          order={selectedOrderForFeedback}
          existingFeedback={existingFeedback}
          isEditing={isEditingFeedback}
          isViewOnly={isViewOnlyFeedback}
          onFeedbackSubmitted={() => {
            loadOrders(true);
            setShowFeedbackModal(false);
            setSelectedOrderForFeedback(null);
            setExistingFeedback(null);
            setIsEditingFeedback(false);
            setIsViewOnlyFeedback(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Order</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <strong>Order #{orderToDelete.order_number}</strong>?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {orderToDelete.customer_info?.display_name || orderToDelete.customer?.username || orderToDelete.customer?.email || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> RS {orderToDelete.total_amount}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {orderToDelete.order_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteOrder(orderToDelete.id)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
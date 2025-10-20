import {
  ClockIcon,
  CogIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  StarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    registeredCustomers: 0,
    guestCustomers: 0,
    activeCustomers: 0,
    staffCount: 0,
    lowStockItems: 0,
    todaySales: 0,
    recentOrders: [],
    lowStockAlerts: [],
    topProducts: [],
    feedback: {
      totalFeedback: 0,
      averageRating: 0,
      recentFeedback: [],
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    },
    customerAnalytics: {
      topCustomers: [],
      customerInsights: {
        repeatCustomers: 0,
        retentionRate: 0,
        avgOrderValue: 0,
        customerLifetimeValue: 0
      },
      recentCustomerActivity: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  // Reports date range 
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Customer Management States
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    user_type: 'customer'
  });

  const isWithinSelectedRange = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const start = new Date(reportDateRange.startDate + 'T00:00:00');
    const end = new Date(reportDateRange.endDate + 'T23:59:59');
    return d >= start && d <= end;
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setError('');
      setLoading(true);

      console.log('🔄 Loading real-time dashboard data from backend...');

      // Fetch dashboard data from backend API
      const response = await fetch('http://localhost:8000/api/orders/admin-dashboard/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dashboard data received from backend:', data);

      // Extract data from backend response
      const overview = data.overview || {};
      const orders = data.orders || {};
      const inventory = data.inventory || {};
      const analytics = data.analytics || {};
      const feedback = data.feedback || {};

      // Update dashboard data with real backend data
      setDashboardData({
        totalOrders: overview.total_orders || 0,
        pendingOrders: overview.pending_orders || 0,
        totalRevenue: overview.total_revenue || 0,
        totalCustomers: overview.total_customers || 0,
        registeredCustomers: overview.registered_customers || 0,
        guestCustomers: overview.guest_customers || 0,
        activeCustomers: overview.active_customers || 0,
        staffCount: overview.staff_count || 0,
        lowStockItems: overview.low_stock_items || 0,
        todaySales: overview.today_sales || 0,
        recentOrders: orders.recent_orders || [],
        lowStockAlerts: inventory.low_stock_alerts || [],
        topProducts: [],
        feedback: {
          totalFeedback: overview.total_feedback || 0,
          averageRating: overview.avg_rating || 0,
          recentFeedback: feedback.recent_feedback || [],
          ratingDistribution: feedback.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        },
        customerAnalytics: {
          topCustomers: [],
          customerInsights: {
            repeatCustomers: 0,
            retentionRate: 0,
            avgOrderValue: 0,
            customerLifetimeValue: 0
          },
          recentCustomerActivity: []
        },
        analytics: analytics
      });


      console.log('✅ Dashboard data updated successfully with real backend data');
      setError('');
      setLastRefresh(new Date());

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(`Dashboard error: ${error.message}`);

      // Set default values on error
      setDashboardData({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        registeredCustomers: 0,
        guestCustomers: 0,
        activeCustomers: 0,
        staffCount: 0,
        lowStockItems: 0,
        todaySales: 0,
        recentOrders: [],
        lowStockAlerts: [],
        topProducts: [],
        feedback: {
          totalFeedback: 0,
          averageRating: 0,
          recentFeedback: [],
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        },
        customerAnalytics: {
          topCustomers: [],
          customerInsights: {
            repeatCustomers: 0,
            retentionRate: 0,
            avgOrderValue: 0,
            customerLifetimeValue: 0
          },
          recentCustomerActivity: []
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!user || user.user_type !== 'admin') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Load customers from backend
  const loadCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      console.log('🔄 Loading customers from backend...');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/users/users/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Customers data received:', data);

        // Handle different response formats
        let customersList = data;
        if (data && data.results && Array.isArray(data.results)) {
          customersList = data.results;
        } else if (data && data.data && Array.isArray(data.data)) {
          customersList = data.data;
        } else if (!Array.isArray(data)) {
          console.error('API response is not in expected format:', data);
          setCustomers([]);
          return;
        }

        console.log(`📊 Total customers from API: ${customersList.length}`);
        setCustomers(customersList);
        setFilteredCustomers(customersList);
      } else {
        const errorData = await response.json();
        console.error('❌ Customers API Error:', errorData);
        setCustomers([]);
      }
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Load customers when component mounts or when customers tab is active
  useEffect(() => {
    if (activeTab === 'customers') {
      loadCustomers();
    }
  }, [activeTab, loadCustomers]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboardData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return `RS ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Customer Management Functions
  const handleAddCustomer = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use the correct backend endpoint: /api/users/auth/register/
      const response = await fetch('http://localhost:8000/api/users/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(newCustomer)
      });

      if (response.ok) {
        setShowAddCustomerModal(false);
        setNewCustomer({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          password: '',
          user_type: 'customer'
        });
        loadDashboardData(); // Refresh data
        loadCustomers(); // Refresh customer list
        alert('Customer added successfully!');
      } else {
        let message = 'Failed to add customer';
        try {
          const errorData = await response.json();
          message = errorData.message || errorData.error || (errorData.errors && JSON.stringify(errorData.errors)) || message;
        } catch (_) { }
        alert(`Error: ${message}`);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Failed to add customer. Please try again.');
    }
  };

  const handleEditCustomer = async () => {
    if (!editingCustomer) return;

    try {
      const token = localStorage.getItem('token');

      // Prepare the data to send - only include fields that are allowed to be updated
      const updateData = {
        username: editingCustomer.username,
        email: editingCustomer.email,
        first_name: editingCustomer.first_name,
        last_name: editingCustomer.last_name,
        user_type: editingCustomer.user_type
      };

      console.log('🔄 Updating customer:', editingCustomer.id, updateData);

      const response = await fetch(`http://localhost:8000/api/users/users/${editingCustomer.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('📡 Update response status:', response.status);

      if (response.ok) {
        const updatedData = await response.json();
        console.log('✅ Customer updated successfully:', updatedData);
        setEditingCustomer(null);
        loadDashboardData(); // Refresh data
        loadCustomers(); // Refresh customer list
        alert('Customer updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Update error:', errorData);
        alert(`Error: ${errorData.detail || errorData.error || 'Failed to update customer'}`);
      }
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      alert('Failed to update customer. Please try again.');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!customerId) return;

    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      console.log('🗑️ Deleting customer:', customerId);

      const response = await fetch(`http://localhost:8000/api/users/users/${customerId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Delete response status:', response.status);

      if (response.ok) {
        console.log('✅ Customer deleted successfully');
        loadDashboardData(); // Refresh data
        loadCustomers(); // Refresh customer list
        alert('Customer deleted successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Delete error:', errorData);
        alert(`Failed to delete customer: ${errorData.detail || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    }
  };

  const handleViewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    // You can add a modal or navigate to a details page here
  };

  // Generate PDF report for feedback
  const generateFeedbackPDF = async () => {
    try {
      console.log('Generating feedback PDF...');

      // Check if jsPDF is available
      if (typeof jsPDF === 'undefined') {
        alert('PDF generation library not loaded. Please refresh the page and try again.');
        return;
      }

      const feedbackData = dashboardData.feedback;
      // Source list: use recentFeedback if present; otherwise empty array
      const sourceList = Array.isArray(feedbackData.recentFeedback) ? feedbackData.recentFeedback : [];
      // Filter strictly by selected date range (inclusive)
      const filteredList = sourceList.filter(f => isWithinSelectedRange(f.created_at || f.date || f.updated_at));
      // Compute stats from filtered list only
      const filteredAvg = filteredList.length > 0
        ? (filteredList.reduce((sum, fb) => sum + (parseFloat(fb.rating) || 0), 0) / filteredList.length)
        : 0;
      const filteredDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      filteredList.forEach(fb => {
        const r = parseInt(fb.rating, 10);
        if (r >= 1 && r <= 5) filteredDist[r] = (filteredDist[r] || 0) + 1;
      });

      // Check if there's feedback data
      if (!feedbackData.totalFeedback && !feedbackData.recentFeedback?.length) {
        alert('No feedback data found. Please ensure there are customer reviews to generate a report.');
        return;
      }

      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      let yPosition = 20;

      // Add title
      doc.setFontSize(20);
      doc.text('Customer Feedback Report', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(`Generated on: ${currentDate}`, 20, yPosition);
      yPosition += 15;
      doc.text(`Date Range: ${reportDateRange.startDate} to ${reportDateRange.endDate}`, 20, yPosition);
      yPosition += 10;

      // Feedback summary
      doc.setFontSize(14);
      doc.text('Feedback Summary', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.text(`Total Feedback (in range): ${filteredList.length}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Average Rating (in range): ${filteredAvg.toFixed(2)}/5.0`, 20, yPosition);
      yPosition += 8;
      doc.text(`Recent Reviews Listed: ${filteredList.length}`, 20, yPosition);
      yPosition += 15;

      // Rating distribution
      if (filteredList.length > 0) {
        doc.setFontSize(14);
        doc.text('Rating Distribution', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        for (let rating = 5; rating >= 1; rating--) {
          const count = filteredDist[rating] || 0;
          doc.text(`${rating} Stars: ${count} reviews`, 20, yPosition);
          yPosition += 6;
        }
        yPosition += 10;
      }

      // Recent feedback
      if (filteredList.length > 0) {
        doc.setFontSize(14);
        doc.text('Recent Customer Feedback', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(8);
        filteredList.slice(0, 15).forEach((feedback, index) => {
          const comment = feedback.comment || feedback.message || 'No comment';
          const shortComment = comment.length > 60 ? comment.substring(0, 60) + '...' : comment;
          const customerName = feedback.customer?.username || feedback.customer?.first_name || 'Anonymous';
          const rating = feedback.rating || 'N/A';

          doc.text(`${index + 1}. ${customerName} - ${rating} stars`, 20, yPosition);
          yPosition += 5;
          doc.text(`   "${shortComment}"`, 20, yPosition);
          yPosition += 8;

          // Add new page if needed
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }

      // Save the PDF
      const fileName = `Feedback_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      alert('PDF report generated successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF report. Error: ${error.message}`);
    }
  };

  // Generate PDF report for orders
  const generateOrderPDF = async () => {
    try {
      console.log('Generating order PDF...');

      // Check if jsPDF is available
      if (typeof jsPDF === 'undefined') {
        alert('PDF generation library not loaded. Please refresh the page and try again.');
        return;
      }

      // Check if there's order data
      if (!dashboardData.totalOrders && !dashboardData.recentOrders?.length) {
        alert('No order data found. Please ensure there are orders to generate a report.');
        return;
      }

      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      let yPosition = 20;

      // Add title
      doc.setFontSize(20);
      doc.text('Order Report', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(`Generated on: ${currentDate}`, 20, yPosition);
      yPosition += 15;

      // Order summary
      doc.setFontSize(14);
      doc.text('Order Summary', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.text(`Total Orders: ${dashboardData.totalOrders}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Pending Orders: ${dashboardData.pendingOrders}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Total Revenue: ${formatCurrency(dashboardData.totalRevenue)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Today's Sales: ${formatCurrency(dashboardData.todaySales)}`, 20, yPosition);
      yPosition += 15;

      // Recent orders
      if (dashboardData.recentOrders && dashboardData.recentOrders.length > 0) {
        doc.setFontSize(14);
        doc.text('Recent Orders', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(8);
        dashboardData.recentOrders.slice(0, 15).forEach((order, index) => {
          const orderDate = new Date(order.created_at).toLocaleDateString();
          const customerName = order.customer?.username || order.customer?.first_name || 'Anonymous';
          const status = order.order_status || 'Unknown';
          const amount = formatCurrency(parseFloat(order.total_amount) || 0);

          doc.text(`${index + 1}. Order #${order.id} - ${customerName}`, 20, yPosition);
          yPosition += 5;
          doc.text(`   Date: ${orderDate} | Status: ${status} | Amount: ${amount}`, 20, yPosition);
          yPosition += 8;

          // Add new page if needed
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }

      // Save the PDF
      const fileName = `Order_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      alert('Order PDF report generated successfully!');

    } catch (error) {
      console.error('Error generating order PDF:', error);
      alert(`Failed to generate order PDF report. Error: ${error.message}`);
    }
  };

  // Show loading while checking authentication
  if (loading || !isAuthenticated || !user || user.user_type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state only for critical errors
  if (error && error !== 'Network error occurred. Please check your connection.') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError('');
                setLoading(true);
                loadDashboardData();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your bakery today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={() => {
                  setAutoRefresh(!autoRefresh);
                  if (!autoRefresh) loadDashboardData();
                }}
                className={`px-3 py-1 rounded text-sm transition-colors ${autoRefresh
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
              <button
                onClick={() => {
                  setLoading(true);
                  loadDashboardData();
                }}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <ClockIcon className="h-4 w-4" />
                )}
                <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <UsersIcon className="h-5 w-5 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ClockIcon },
              { id: 'orders', name: 'Orders', icon: ShoppingCartIcon },
              { id: 'inventory', name: 'Inventory', icon: CubeIcon },
              { id: 'customers', name: 'Customers', icon: UsersIcon },
              { id: 'reports', name: 'Reports', icon: DocumentTextIcon },
              { id: 'others', name: 'Others', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'others') {
                    navigate('/admin/others');
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.pendingOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(dashboardData.totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalCustomers}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="inline-block mr-3">
                        <span className="font-medium text-purple-600">{dashboardData.registeredCustomers || 0}</span> registered
                      </span>
                      <span className="inline-block">
                        <span className="font-medium text-gray-600">{dashboardData.guestCustomers || 0}</span> guest
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <StarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.feedback.averageRating}/5</p>
                    <p className="text-xs text-gray-500">Based on {dashboardData.totalCustomers} customers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCartIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Manage Orders</p>
                      <p className="text-sm text-gray-600">Update status, track delivery</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <CubeIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Inventory</p>
                      <p className="text-sm text-gray-600">Check stock levels</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('customers')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <UsersIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Customers</p>
                      <p className="text-sm text-gray-600">View customer data</p>
                    </div>
                  </button>
                </div>

                {/* Catalog & Offer Management */}
                <div className="mt-6 grid grid-cols-1 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Catalog Management</p>
                        <p className="text-sm text-gray-600">Manage cakes, categories and offers</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => navigate('/admin/catalog?tab=cakes')}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Manage Cakes
                      </button>
                      <button
                        onClick={() => navigate('/admin/catalog?tab=categories')}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Manage Categories
                      </button>
                      <button
                        onClick={() => navigate('/admin/offers')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Manage Offers
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border border-blue-200">
                <div className="px-6 py-5 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
                  <div className="flex items-center">
                    <ShoppingCartIcon className="h-6 w-6 text-white mr-3" />
                    <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {(dashboardData.recentOrders || []).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <p className="font-semibold text-gray-900">#{order.order_number}</p>
                            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                            <p className="text-xs text-gray-500">
                              {order.customer?.display_name || order.customer_name || 'Anonymous'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                            {order.order_status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl shadow-lg border border-yellow-200">
                <div className="px-6 py-5 border-b border-yellow-200 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-t-xl">
                  <div className="flex items-center">
                    <StarIcon className="h-6 w-6 text-white mr-3" />
                    <h3 className="text-lg font-semibold text-white">Recent Customer Feedback</h3>
                  </div>
                </div>
                <div className="p-6">
                  {(dashboardData.feedback.recentFeedback || []).length > 0 ? (
                    <div className="space-y-4">
                      {(dashboardData.feedback.recentFeedback || []).map((feedback) => (
                        <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarIcon
                                    key={star}
                                    className={`h-4 w-4 ${star <= feedback.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                      }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {formatDate(feedback.created_at)}
                            </span>
                          </div>
                          <div className="ml-6">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {feedback.user_info?.display_name || feedback.user_info?.username || feedback.user_info?.email || 'Anonymous'}
                            </p>
                            {feedback.message && (
                              <p className="text-gray-700 text-sm leading-relaxed">{feedback.message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No feedback received yet</p>
                      <p className="text-gray-400 text-sm mt-1">Customer feedback will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-center">
                <div className="text-center p-6 border border-gray-200 rounded-lg max-w-md">
                  <ShoppingCartIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Manage Orders</h4>
                  <p className="text-gray-600 mb-4">Update order status and manage customer orders</p>
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Inventory Management</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <CubeIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Stock Levels</h4>
                  <p className="text-gray-600 mb-4">Monitor current stock levels and set reorder points</p>
                  <button
                    onClick={() => navigate('/inventory')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Stock
                  </button>
                </div>
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <DocumentTextIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Purchase Orders</h4>
                  <p className="text-gray-600 mb-4">View purchase orders and supplier information</p>
                  <button
                    onClick={() => navigate('/inventory?tab=purchase-orders')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View PO
                  </button>
                </div>
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Low Stock Alerts</h4>
                  <p className="text-gray-600 mb-4">Get notified when items need reordering</p>
                  <button
                    onClick={() => navigate('/inventory?tab=overview&showLowStock=true')}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View Alerts
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Customer Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Customers</p>
                      <p className="text-2xl font-bold text-blue-900">{dashboardData.totalCustomers}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Active Customers</p>
                      <p className="text-2xl font-bold text-green-900">{dashboardData.activeCustomers}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Staff Members</p>
                      <p className="text-2xl font-bold text-purple-900">{dashboardData.staffCount}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg border border-yellow-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-yellow-900">RS {dashboardData.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Management Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Customer Management</h3>
                    <p className="text-sm text-gray-600">Manage customer accounts, view details, and track activity</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAddCustomerModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Customer
                    </button>
                    <button
                      onClick={() => setShowCustomerSearch(true)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer List */}
              <div className="p-6">
                {loadingCustomers ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading customers...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, index) => (
                        <div key={customer.id || index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-lg">
                                    {(customer?.first_name?.[0] || customer?.username?.[0] || 'G').toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {customer?.first_name && customer?.last_name
                                      ? `${customer?.first_name} ${customer?.last_name}`.trim()
                                      : customer?.username || customer?.email || 'Guest Customer'}
                                  </h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.user_type === 'admin' ? 'bg-red-100 text-red-800' :
                                    customer.user_type === 'staff' ? 'bg-purple-100 text-purple-800' :
                                      customer.user_type === 'delivery' ? 'bg-orange-100 text-orange-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                    {customer.user_type?.toUpperCase() || 'CUSTOMER'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {customer?.email || 'No email provided'}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span>Joined: {customer.date_joined ? new Date(customer.date_joined).toLocaleDateString() : 'N/A'}</span>
                                  <span>•</span>
                                  <span>Username: {customer.username || 'N/A'}</span>
                                  <span>•</span>
                                  <span>ID: {customer.id}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedCustomer(customer)}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => setEditingCustomer(customer)}
                                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                              >
                                Edit
                              </button>
                              {customer.user_type !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                  className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No customers found</p>
                        <p className="text-gray-400 text-sm mt-1">Add your first customer to get started</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {activeTab === 'reports' && (
          <div className="space-y-8">
            {/* Reports Header */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Business Reports</h3>
                <p className="text-sm text-gray-600">Generate and download business reports as PDF</p>
              </div>
              <div className="p-6">
                {/* Report Date Range - like Inventory */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Report Date Range</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={reportDateRange.startDate}
                        onChange={(e) => setReportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={reportDateRange.endDate}
                        onChange={(e) => setReportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <button
                        onClick={() => { /* no-op: range used at download time */ }}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Generate Feedback PDF */}
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <StarIcon className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                    <h4 className="text-xl font-medium text-gray-900 mb-2">Feedback Report</h4>
                    <p className="text-gray-600 mb-4">Download customer feedback analysis as PDF</p>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Total Feedback:</span> {dashboardData.feedback.totalFeedback}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Avg Rating:</span> {dashboardData.feedback.averageRating}/5 (based on {dashboardData.totalCustomers} customers)
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Recent Reviews:</span> {dashboardData.feedback.recentFeedback.length}
                      </div>
                    </div>
                    <button
                      onClick={generateFeedbackPDF}
                      className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center mx-auto space-x-2"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      <span>Download Feedback Report</span>
                    </button>
                  </div>

                  {/* Generate Order PDF */}
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <ShoppingCartIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-xl font-medium text-gray-900 mb-2">Order Report</h4>
                    <p className="text-gray-600 mb-4">Download order analysis and sales data as PDF</p>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Total Orders:</span> {dashboardData.totalOrders}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Pending Orders:</span> {dashboardData.pendingOrders}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Total Revenue:</span> {formatCurrency(dashboardData.totalRevenue)}
                      </div>
                    </div>
                    <button
                      onClick={generateOrderPDF}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto space-x-2"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      <span>Download Order Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Reports Overview</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Feedback Rating Distribution */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Rating Distribution</h4>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                          <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${dashboardData.feedback.totalFeedback > 0
                                  ? (dashboardData.feedback.ratingDistribution[rating] / dashboardData.feedback.totalFeedback) * 100
                                  : 0}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {dashboardData.feedback.ratingDistribution[rating] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Orders Summary */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Recent Orders Status</h4>
                    <div className="space-y-3">
                      {dashboardData.recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium">#{order.order_number}</span>
                            <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">{formatCurrency(order.total_amount)}</span>
                            <span className={`block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                              {order.order_status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Customer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newCustomer.username}
                  onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newCustomer.password}
                  onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select
                  value={newCustomer.user_type}
                  onChange={(e) => setNewCustomer({ ...newCustomer, user_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="delivery">Delivery Person</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Customer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editingCustomer.username || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, username: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editingCustomer.first_name || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, first_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editingCustomer.last_name || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, last_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select
                  value={editingCustomer.user_type || 'customer'}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, user_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="delivery">Delivery Person</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingCustomer(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCustomer}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Customer Details</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">
                      {selectedCustomer?.first_name && selectedCustomer?.last_name
                        ? `${selectedCustomer?.first_name} ${selectedCustomer?.last_name}`.trim()
                        : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="text-gray-900">{selectedCustomer?.username || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedCustomer?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Type</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCustomer.user_type === 'admin' ? 'bg-red-100 text-red-800' :
                      selectedCustomer.user_type === 'staff' ? 'bg-purple-100 text-purple-800' :
                        selectedCustomer.user_type === 'delivery' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                      }`}>
                      {selectedCustomer.user_type?.toUpperCase() || 'CUSTOMER'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="text-gray-900">{selectedCustomer?.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Joined</label>
                    <p className="text-gray-900">
                      {selectedCustomer?.date_joined
                        ? new Date(selectedCustomer.date_joined).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Account Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Active Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCustomer?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedCustomer?.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Staff Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCustomer?.is_staff ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {selectedCustomer?.is_staff ? 'STAFF' : 'REGULAR USER'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedCustomer?.email || 'Not provided'}</p>
                  </div>
                  {selectedCustomer?.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingCustomer(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Search Modal */}
      {showCustomerSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Customers</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Term</label>
                <input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    // Filter customers in real-time
                    const filtered = customers.filter(customer =>
                      customer.username?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      customer.email?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      customer.first_name?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      customer.last_name?.toLowerCase().includes(e.target.value.toLowerCase())
                    );
                    setFilteredCustomers(filtered);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name, email, or username"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCustomerSearch(false);
                  setCustomerSearchTerm('');
                  setFilteredCustomers(customers);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setShowCustomerSearch(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

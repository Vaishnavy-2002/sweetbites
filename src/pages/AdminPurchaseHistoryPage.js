import {
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ShoppingCartIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminPurchaseHistoryPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAllData, setShowAllData] = useState(false);
    const [summary, setSummary] = useState({
        totalPurchases: 0,
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

    // Load purchase history from API
    const loadPurchaseHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading purchase history...');

            const token = localStorage.getItem('token');
            console.log('Token found:', !!token);

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:8000/api/orders/orders/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Purchase history data:', data);

                // Handle different response formats
                let ordersData = data;

                // If data is wrapped in a results property (pagination)
                if (data && data.results && Array.isArray(data.results)) {
                    ordersData = data.results;
                }
                // If data is wrapped in a data property
                else if (data && data.data && Array.isArray(data.data)) {
                    ordersData = data.data;
                }
                // If data is already an array
                else if (Array.isArray(data)) {
                    ordersData = data;
                }
                // If data is an object with orders property
                else if (data && data.orders && Array.isArray(data.orders)) {
                    ordersData = data.orders;
                }
                else {
                    console.error('API response is not in expected format:', data);
                    setPurchaseHistory([]);
                    setError('Invalid data format received from server. Expected array but got: ' + typeof data);
                    return;
                }

                // Filter by date range (skip if showAllData is true)
                const filteredOrders = showAllData ? ordersData : ordersData.filter(order => {
                    if (!order.created_at) return false;
                    const orderDate = new Date(order.created_at);
                    const startDate = new Date(dateRange.startDate + 'T00:00:00');
                    const endDate = new Date(dateRange.endDate + 'T23:59:59');
                    return orderDate >= startDate && orderDate <= endDate;
                });

                // Filter by status
                const finalOrders = filterStatus === 'all'
                    ? filteredOrders
                    : filteredOrders.filter(order => order.order_status === filterStatus);

                setPurchaseHistory(finalOrders);

                // Calculate summary
                const summaryData = {
                    totalPurchases: finalOrders.length,
                    totalRevenue: finalOrders.reduce((sum, order) => {
                        const amount = parseFloat(order.total_amount || 0);
                        return sum + (isNaN(amount) ? 0 : amount);
                    }, 0),
                    averageOrderValue: 0,
                    completedOrders: finalOrders.filter(order => order.order_status === 'delivered').length,
                    pendingOrders: finalOrders.filter(order => order.order_status === 'pending').length,
                    cancelledOrders: finalOrders.filter(order => order.order_status === 'cancelled').length
                };

                summaryData.averageOrderValue = summaryData.totalPurchases > 0
                    ? summaryData.totalRevenue / summaryData.totalPurchases
                    : 0;

                setSummary(summaryData);
                setError(null);
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                setError('Failed to load purchase history: ' + (errorData.detail || 'Unknown error'));
                setPurchaseHistory([]);
            }
        } catch (error) {
            console.error('Error loading purchase history:', error);
            setError('Error loading purchase history: ' + error.message);
            setPurchaseHistory([]);
        } finally {
            setLoading(false);
        }
    };

    // Load purchase history on component mount and when filters change
    useEffect(() => {
        loadPurchaseHistory();
    }, [dateRange, filterStatus, showAllData]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadPurchaseHistory();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

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

    // Format currency helper
    const formatCurrency = (amount) => {
        return `RS ${parseFloat(amount || 0).toFixed(2)}`;
    };

    // Show loading while checking authentication or loading data
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading purchase history...</p>
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Purchase History</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={loadPurchaseHistory}
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
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
                            <p className="text-gray-600">View and analyze customer purchase patterns</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Live Data</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Last updated: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={showAllData}
                                    onChange={(e) => setShowAllData(e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Show All Data</span>
                            </label>
                            <button
                                onClick={loadPurchaseHistory}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Refresh</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                disabled={showAllData}
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${showAllData ? 'bg-gray-100' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                disabled={showAllData}
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${showAllData ? 'bg-gray-100' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            >
                                {orderStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status === 'all' ? 'All Statuses' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {showAllData && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Show All Data:</strong> Displaying all orders regardless of date range. Uncheck to filter by specific dates.
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Purchase History List */}
                    <div className="lg:col-span-3">
                        <div className="space-y-4">
                            {!Array.isArray(purchaseHistory) || purchaseHistory.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <ShoppingCartIcon className="mx-auto h-12 w-12" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase History Found</h3>
                                    <p className="text-gray-600 mb-4">
                                        {showAllData
                                            ? "There are no orders in the database."
                                            : "There are no purchases to display for the selected filters."
                                        }
                                    </p>
                                    <div className="space-y-2">
                                        <button
                                            onClick={loadPurchaseHistory}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
                                        >
                                            Refresh Data
                                        </button>
                                        {!showAllData && (
                                            <button
                                                onClick={() => setShowAllData(true)}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Show All Data
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-4 text-sm text-gray-500">
                                        <p>Current filters:</p>
                                        <p>Date Range: {showAllData ? 'All dates' : `${dateRange.startDate} to ${dateRange.endDate}`}</p>
                                        <p>Status: {filterStatus === 'all' ? 'All statuses' : filterStatus}</p>
                                    </div>
                                </div>
                            ) : (
                                Array.isArray(purchaseHistory) && purchaseHistory.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-lg shadow-md p-6"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                                                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                                                <p className="text-sm text-gray-600">Customer: {order.customer?.username || 'Unknown'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-lg">{formatCurrency(order.total_amount)}</p>
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
                                                    </span>
                                                    <span className="font-medium">{formatCurrency(item.total_price)}</span>
                                                </div>
                                            ))}
                                            {Array.isArray(order.items) && order.items.length > 3 && (
                                                <p className="text-sm text-gray-500">
                                                    +{order.items.length - 3} more items
                                                </p>
                                            )}
                                        </div>

                                        {/* Shipping Address */}
                                        {order.shipping_address && (
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
                                            </div>
                                        )}

                                        {/* Status Timeline */}
                                        {Array.isArray(order.status_history) && order.status_history.length > 0 && (
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

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4">Purchase Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Purchases</span>
                                    <span className="font-medium text-lg">{summary.totalPurchases}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Revenue</span>
                                    <span className="font-medium text-lg text-green-600">{formatCurrency(summary.totalRevenue)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Average Order Value</span>
                                    <span className="font-medium text-lg">{formatCurrency(summary.averageOrderValue)}</span>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-3">Order Status Breakdown</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Completed</span>
                                            <span className="font-medium text-green-600">{summary.completedOrders}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Pending</span>
                                            <span className="font-medium text-yellow-600">{summary.pendingOrders}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cancelled</span>
                                            <span className="font-medium text-red-600">{summary.cancelledOrders}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Data Status</h4>
                                    <div className="text-sm text-gray-600">
                                        <p>Filter: {showAllData ? 'All Data' : 'Date Range'}</p>
                                        <p>Status: {filterStatus === 'all' ? 'All' : filterStatus}</p>
                                        <p>Last Refresh: {new Date().toLocaleTimeString()}</p>
                                    </div>
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
                                        onClick={() => navigate('/admin/reports')}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                    >
                                        View Reports
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
        </div>
    );
};

export default AdminPurchaseHistoryPage;

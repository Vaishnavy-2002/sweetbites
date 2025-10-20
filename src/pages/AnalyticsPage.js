import {
    ArrowLeftIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    FireIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [salesData, setSalesData] = useState({
        topCakes: [],
        lowPerformers: [],
        topPerformer: 'N/A',
        period: 'month',
        dateRange: {}
    });
    const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year
    const [lastUpdated, setLastUpdated] = useState('');

    // Promote modal state
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [selectedCake, setSelectedCake] = useState(null);
    const [promoteFormData, setPromoteFormData] = useState({
        title: '',
        offer_type: 'percentage',
        status: 'draft',
        minimum_order_amount: 0,
        discount_percentage: 15,
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        max_usage: '',
        background_color: '#FF6B6B',
        text_color: '#FFFFFF',
        description: ''
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            loadSalesData();

            // Set up auto-refresh every 30 seconds
            const interval = setInterval(loadSalesData, 30000);
            return () => clearInterval(interval);
        }
    }, [selectedPeriod, isAuthenticated, user]);

    const loadSalesData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch best-selling items data from analytics endpoint
            const response = await api.get(`/api/analytics/best-selling-items/?period=${selectedPeriod}`);

            if (response.data) {
                const data = response.data;

                const salesData = {
                    topCakes: data.top_cakes || [],
                    lowPerformers: data.low_performers || [],
                    topPerformer: data.summary.top_performer || 'N/A',
                    period: data.summary.period || 'month',
                    dateRange: data.summary.date_range || {}
                };

                setSalesData(salesData);
                setLastUpdated(data.last_updated || new Date().toISOString());
            }
        } catch (err) {
            console.error('Error loading sales data:', err);
            setError('Failed to load sales data: ' + (err.response?.data?.error || err.message));

            // Fallback to empty data if API fails
            const emptyData = {
                topCakes: [],
                lowPerformers: [],
                topPerformer: 'N/A',
                period: selectedPeriod,
                dateRange: {}
            };
            setSalesData(emptyData);
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteClick = async (cake) => {
        setSelectedCake(cake);

        // Set default form data
        setPromoteFormData({
            title: `Promotion for ${cake.name}`,
            offer_type: 'percentage',
            status: 'draft',
            minimum_order_amount: 0,
            discount_percentage: 15,
            start_date: new Date().toISOString().slice(0, 16),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            max_usage: '',
            background_color: '#FF6B6B',
            text_color: '#FFFFFF',
            description: `Special promotion to boost sales for ${cake.name}`
        });

        setShowPromoteModal(true);
    };

    const handleCreatePromotion = async () => {
        try {
            const response = await api.post('/api/offers/', promoteFormData);

            if (response.data) {
                alert(`Promotion created successfully for ${selectedCake.name}!`);
                setShowPromoteModal(false);
                loadSalesData();
            }
        } catch (err) {
            console.error('Error creating promotion:', err);
            alert('Failed to create promotion. Please try again.');
        }
    };


    const handleFormChange = (field, value) => {
        setPromoteFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDeleteCake = async (cakeId) => {
        if (window.confirm('Are you sure you want to delete this cake? This action cannot be undone.')) {
            try {
                console.log('🗑️ Attempting to delete cake with ID:', cakeId);

                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                console.log('🔑 Token found:', token.substring(0, 10) + '...');

                const response = await fetch(`http://localhost:8000/api/admin/cakes/${cakeId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📡 Delete response status:', response.status);
                console.log('📡 Delete response headers:', response.headers);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('❌ Delete error response:', errorData);
                    throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
                }

                console.log('✅ Cake deleted successfully');
                alert('Cake deleted successfully!');
                // Refresh data to show updated information
                loadSalesData();
            } catch (err) {
                console.error('❌ Error deleting cake:', err);
                alert(`Failed to delete cake: ${err.message}`);
            }
        }
    };

    const formatCurrency = (amount) => {
        return `Rs ${amount.toLocaleString()}`;
    };

    const getMaxSales = () => {
        return Math.max(...salesData.topCakes.map(cake => cake.sales));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/admin/others')}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Best-Selling Items & Profit Analyzer</h1>
                                <p className="text-sm text-gray-600">Analyze sales performance and profit margins</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                            >
                                <ChartBarIcon className="h-5 w-5" />
                                <span>Best-Selling Items & Profit Analyzer</span>
                            </button>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                            <div className="text-sm text-gray-500">
                                {salesData.dateRange.start_date && salesData.dateRange.end_date && (
                                    <div className="mb-1">
                                        {new Date(salesData.dateRange.start_date).toLocaleDateString()} - {new Date(salesData.dateRange.end_date).toLocaleDateString()}
                                    </div>
                                )}
                                {lastUpdated && (
                                    <div>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* Top Performer Card */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border border-yellow-200">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <FireIcon className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Top Performer</p>
                                    <p className="text-xl font-semibold text-gray-900">{salesData.topPerformer}</p>
                                    <p className="text-xs text-gray-500">Cake with most sales this {salesData.period}</p>
                                </div>
                            </div>
                        </div>

                        {/* All Cakes Bar Chart */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    All Cakes This {salesData.period === 'week' ? 'Week' : salesData.period === 'year' ? 'Year' : 'Month'} (Lowest to Highest Sales)
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span>Sales Count</span>
                                    <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
                                    <span>Profit %</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {salesData.topCakes.map((cake, index) => {
                                    const maxSales = getMaxSales();
                                    const barWidth = (cake.sales / maxSales) * 100;
                                    return (
                                        <div key={cake.id} className="flex items-center space-x-4">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{cake.name}</h4>
                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <span className="text-gray-600">{cake.sales} sales</span>
                                                        <span className="text-green-600 font-medium">{cake.profit_margin}% profit</span>
                                                        <span className="text-gray-900 font-medium">{formatCurrency(cake.revenue)}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                                                        style={{ width: `${barWidth}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Low Performers Alert */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
                                    <h3 className="text-lg font-semibold text-gray-900">Low Performer Alerts</h3>
                                </div>
                                <span className="text-sm text-gray-500">
                                    All products with 0 sales this {salesData.period}
                                </span>
                            </div>
                            {salesData.lowPerformers.length > 0 ? (
                                <div className="space-y-4">
                                    {salesData.lowPerformers.map((cake) => (
                                        <div key={cake.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    {cake.image ? (
                                                        <img src={cake.image} alt={cake.name} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <EyeIcon className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{cake.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {cake.sales} sales • {cake.days_since_last_sale || 'N/A'} days since last sale
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Revenue: {formatCurrency(cake.revenue)} • Profit margin: {cake.profit_margin}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handlePromoteClick(cake)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    Promote
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCake(cake.id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <ExclamationTriangleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium">No Zero-Sales Products!</p>
                                    <p className="text-sm">All products have been ordered at least once this {salesData.period}.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Promote Modal */}
            {showPromoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Create Promotion
                            </h3>
                            <button
                                onClick={() => setShowPromoteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>


                        {/* Promotion Form */}
                        <div className="p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Create New Promotion
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={promoteFormData.title}
                                        onChange={(e) => handleFormChange('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Promotion title"
                                    />
                                </div>

                                {/* Offer Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Type</label>
                                    <select
                                        value={promoteFormData.offer_type}
                                        onChange={(e) => handleFormChange('offer_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="percentage">Percentage Discount</option>
                                        <option value="fixed">Fixed Amount Discount</option>
                                        <option value="free_delivery">Free Delivery</option>
                                        <option value="buy_one_get_one">Buy One Get One</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={promoteFormData.status}
                                        onChange={(e) => handleFormChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                    </select>
                                </div>

                                {/* Minimum Order Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount</label>
                                    <input
                                        type="number"
                                        value={promoteFormData.minimum_order_amount}
                                        onChange={(e) => handleFormChange('minimum_order_amount', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Discount Percentage */}
                                {promoteFormData.offer_type === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                                        <input
                                            type="number"
                                            value={promoteFormData.discount_percentage}
                                            onChange={(e) => handleFormChange('discount_percentage', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </div>
                                )}

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={promoteFormData.start_date}
                                        onChange={(e) => handleFormChange('start_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={promoteFormData.end_date}
                                        onChange={(e) => handleFormChange('end_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Max Usage */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Usage (optional)</label>
                                    <input
                                        type="number"
                                        value={promoteFormData.max_usage}
                                        onChange={(e) => handleFormChange('max_usage', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                    />
                                </div>

                                {/* Background Color */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                    <input
                                        type="color"
                                        value={promoteFormData.background_color}
                                        onChange={(e) => handleFormChange('background_color', e.target.value)}
                                        className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Text Color */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                    <input
                                        type="color"
                                        value={promoteFormData.text_color}
                                        onChange={(e) => handleFormChange('text_color', e.target.value)}
                                        className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={promoteFormData.description}
                                        onChange={(e) => handleFormChange('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Promotion description"
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                                <button
                                    onClick={() => setShowPromoteModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreatePromotion}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Create Promotion
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;

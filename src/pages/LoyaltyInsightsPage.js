import {
    ArrowLeftIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    ChartBarIcon,
    EnvelopeIcon,
    HeartIcon,
    StarIcon,
    TagIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoyaltyInsightsPage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loyaltyData, setLoyaltyData] = useState({
        customers: {
            repeat_customers: 0,
            top_customer: null,
            total_customers: 0,
            returning_customers: 0
        },
        metrics: {
            retention_rate: 0,
            avg_order_value: 0,
            repeat_purchase_rate: 0
        },
        analytics: {
            total_loyal_customers: 0,
            avg_lifetime_value: 0,
            avg_orders_per_customer: 0,
            customer_satisfaction: 0
        }
    });
    const [error, setError] = useState(null);

    // Fetch loyalty insights data
    const fetchLoyaltyData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8000/api/analytics/customer-loyalty/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setLoyaltyData(data);
        } catch (err) {
            console.error('Error fetching loyalty data:', err);
            setError('Failed to load loyalty insights data');
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        if (token) {
            fetchLoyaltyData();
        }
    }, [token]);

    const handleSendThankYouEmail = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/analytics/send-gratitude-emails/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Show detailed results
            let message = `${data.message}\n\n`;
            if (data.email_details && data.email_details.length > 0) {
                message += 'Emails sent to:\n';
                data.email_details.forEach((detail, index) => {
                    message += `${index + 1}. ${detail.customer_name} (${detail.email}) - ${detail.orders} orders, Rs ${detail.total_spent.toLocaleString()}\n`;
                });
            }

            alert(message);

            // Refresh data after sending emails
            fetchLoyaltyData();
        } catch (err) {
            console.error('Error sending thank you emails:', err);
            alert('Failed to send thank you emails');
        } finally {
            setLoading(false);
        }
    };

    const handleOfferDiscount = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/analytics/create-special-offers/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Only show alert if offers were actually created
            if (data.offers_created > 0) {
                let message = `Special Offers Created!\n\n`;

                if (data.offer_details && data.offer_details.length > 0) {
                    message += 'Special offers created:\n';
                    data.offer_details.forEach((detail, index) => {
                        message += `${index + 1}. ${detail.customer_name} - ${detail.discount_percentage}% off (${detail.milestone} orders milestone)\n`;
                        message += `   Offer Code: ${detail.offer_code}\n`;
                        message += `   Valid until: ${detail.valid_until}\n\n`;
                    });
                }
                alert(message);
            } else {
                // Don't show alert for empty results - just log to console
                console.log('No customers eligible for special offers yet (need 10+ total orders)');
            }

            // Refresh data after creating offers
            fetchLoyaltyData();
        } catch (err) {
            console.error('Error creating special offers:', err);
            alert('Failed to create special offers');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `Rs ${amount.toLocaleString()}`;
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
                                <h1 className="text-2xl font-bold text-gray-900">Loyalty Insights</h1>
                                <p className="text-sm text-gray-600">Analyze customer loyalty and retention patterns</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchLoyaltyData}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                                <ChartBarIcon className="h-5 w-5" />
                                <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                    </div>
                )}

                {/* Main Content */}
                {!loading && (
                    <div className="space-y-8">
                        {/* Customers Section */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <UserGroupIcon className="h-6 w-6 text-purple-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Repeat Customers Card */}
                                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-xl shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-semibold mb-2">Repeat Customers</h4>
                                            <p className="text-3xl font-bold mb-1">{loyaltyData.customers.repeat_customers} customers</p>
                                            <p className="text-purple-100 text-sm">ordered more than 5 times</p>
                                        </div>
                                        <HeartIcon className="h-12 w-12 text-purple-200" />
                                    </div>
                                </div>

                                {/* Top Repeat Customer Card */}
                                <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-xl shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-semibold mb-2">Top Repeat Customer</h4>
                                            {loyaltyData.customers.top_customer ? (
                                                <>
                                                    <p className="text-2xl font-bold mb-1">{loyaltyData.customers.top_customer.name}</p>
                                                    <p className="text-pink-100 text-sm">{loyaltyData.customers.top_customer.orders} orders, {formatCurrency(loyaltyData.customers.top_customer.total_spend)} total spend</p>
                                                </>
                                            ) : (
                                                <p className="text-pink-100 text-sm">No repeat customers yet</p>
                                            )}
                                        </div>
                                        <StarIcon className="h-12 w-12 text-pink-200" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Engagement Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Engagement Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={handleSendThankYouEmail}
                                    className="bg-blue-600 text-white p-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-4 hover:shadow-xl hover:scale-105"
                                >
                                    <EnvelopeIcon className="h-8 w-8 text-blue-200" />
                                    <div className="text-left">
                                        <h4 className="text-lg font-semibold">Send Thank You Email</h4>
                                        <p className="text-blue-100 text-sm">Express gratitude to loyal customers</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleOfferDiscount}
                                    className="bg-green-600 text-white p-6 rounded-xl shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-4 hover:shadow-xl hover:scale-105"
                                >
                                    <TagIcon className="h-8 w-8 text-green-200" />
                                    <div className="text-left">
                                        <h4 className="text-lg font-semibold">Offer Discount</h4>
                                        <p className="text-green-100 text-sm">Create special offers for repeat customers</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Customer Insights */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Insights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-sm mb-1">Customer retention rate</p>
                                            <p className="text-3xl font-bold">{loyaltyData.metrics.retention_rate}%</p>
                                        </div>
                                        <ChartBarIcon className="h-8 w-8 text-green-200" />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm mb-1">Average order value</p>
                                            <p className="text-3xl font-bold">{formatCurrency(loyaltyData.metrics.avg_order_value)}</p>
                                        </div>
                                        <ArrowTrendingUpIcon className="h-8 w-8 text-blue-200" />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm mb-1">Repeat purchase rate</p>
                                            <p className="text-3xl font-bold">{loyaltyData.metrics.repeat_purchase_rate}%</p>
                                        </div>
                                        <CalendarIcon className="h-8 w-8 text-purple-200" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Customers List */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Customers by Total Spend</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order Value</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loyaltyData.top_customers?.slice(0, 10).map((customer, index) => (
                                            <tr key={customer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8">
                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                                                <span className="text-white text-sm font-medium">{index + 1}</span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.total_orders}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(customer.total_spent)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(customer.avg_order_value)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Additional Analytics */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Loyalty Program Analytics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{loyaltyData.analytics.total_loyal_customers}</div>
                                        <div className="text-sm text-gray-600">Total Loyal Customers</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(loyaltyData.analytics.avg_lifetime_value)}</div>
                                        <div className="text-sm text-gray-600">Avg. Lifetime Value</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{loyaltyData.analytics.avg_orders_per_customer}</div>
                                        <div className="text-sm text-gray-600">Avg. Orders per Customer</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{loyaltyData.analytics.customer_satisfaction}%</div>
                                        <div className="text-sm text-gray-600">Customer Satisfaction</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoyaltyInsightsPage;

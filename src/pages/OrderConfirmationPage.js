import { CheckCircleIcon, CreditCardIcon, TruckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();

  const [orderPreview, setOrderPreview] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showPaymentSelection, setShowPaymentSelection] = useState(true);

  // Credit card form state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [cardErrors, setCardErrors] = useState({});

  const loadExistingOrder = useCallback(async () => {
    try {
      console.log('🔍 Loading existing order with ID:', orderId);
      const token = localStorage.getItem('token');
      console.log('User token:', token);

      // Prepare headers - include auth token if available
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`http://localhost:8000/api/orders/orders/${orderId}/`, {
        headers: headers
      });

      console.log('📡 API Response Status:', response.status);

      if (response.ok) {
        const orderData = await response.json();
        console.log('✅ Order data loaded:', orderData);

        setOrder(orderData);
        // Convert existing order to preview format for display
        setOrderPreview({
          order_type: orderData.order_type,
          shipping_address: orderData.shipping_address,
          delivery_instructions: orderData.delivery_instructions,
          items: orderData.items,
          subtotal: orderData.subtotal || 0,
          delivery_fee: orderData.delivery_fee || 0,
          total_amount: orderData.total_amount || 0
        });
        setIsPreview(true); // This is a view-only mode
      } else {
        const errorText = await response.text();
        console.log('❌ API Error:', response.status, errorText);
        setError(`Failed to load order details: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error('❌ Network error loading order:', err);
      setError('Network error loading order details');
    }
  }, [orderId, navigate]);

  useEffect(() => {
    console.log('🔄 OrderConfirmationPage useEffect triggered');
    console.log('📋 orderId:', orderId);
    console.log('📍 location.state:', location.state);

    // Check if we're viewing an existing order
    if (orderId) {
      console.log('✅ OrderId found, loading existing order');
      loadExistingOrder();
    } else if (location.state?.orderPreview) {
      console.log('✅ OrderPreview found in location state');
      // Check if we have order preview data from shipping address page
      setOrderPreview(location.state.orderPreview);
      setIsPreview(location.state.isPreview || false);
    } else {
      console.log('❌ No orderId or orderPreview, redirecting to shipping address');
      // If no preview data and no orderId, redirect to shipping address
      navigate('/shipping-address');
    }
  }, [orderId, location.state, navigate, loadExistingOrder]);

  const handlePlaceOrder = async () => {
    if (!orderPreview) {
      setError('No order data available. Please try again.');
      return;
    }

    const token = localStorage.getItem('token');
    const isGuest = !token;

    // Proceed with order placement directly
    await placeOrderWithData(isGuest, null);
  };

  const placeOrderWithData = async (isGuest, email = null) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty. Please add items to your cart first.');
      }

      // Validate each cart item
      const validItems = cartItems.filter(item => {
        if (!item.id || !item.quantity || item.quantity <= 0) {
          console.warn('Invalid cart item:', item);
          return false;
        }
        return true;
      });

      if (validItems.length === 0) {
        throw new Error('No valid items in your cart. Please refresh and try again.');
      }

      // Validate shipping address
      if (!orderPreview.shipping_address) {
        throw new Error('Please provide a shipping address.');
      }

      // Prepare order data for guest checkout
      const orderData = {
        order_type: orderPreview.order_type || 'online',
        delivery_instructions: selectedPaymentMethod === 'card' ? 'Credit card payment order' : 'Cash on delivery order',
        payment_method: selectedPaymentMethod || 'cash', // Use selected payment method
        is_guest_order: isGuest, // Flag to indicate guest order
        guest_email: isGuest ? email : null,
        guest_phone: isGuest ? (orderPreview.shipping_address?.phone || '') : undefined,
        // Include shipping address directly for guest orders
        shipping_address: orderPreview.shipping_address,
        items: validItems.map(item => ({
          cake_id: item.id,
          quantity: item.quantity,
          unit_price: item.price, // Send the frontend-calculated price (includes customizations)
          total_price: item.price * item.quantity, // Send the frontend-calculated total
          customization_notes: item.customizations ? JSON.stringify(item.customizations) : ''
        }))
      };

      console.log('Submitting order:', orderData);
      console.log('Order preview:', orderPreview);
      console.log('Cart items:', cartItems);
      console.log('Is guest order:', isGuest);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Add authorization header only if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch('http://localhost:8000/api/orders/orders/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to place order. Please try again.';
        try {
          const errorData = await response.json();
          console.error('Order creation error:', errorData);

          // Handle different types of errors
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors.join(', ');
          } else if (typeof errorData === 'object') {
            // Handle field-specific errors
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('; ');
            if (fieldErrors) {
              errorMessage = fieldErrors;
            }
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const orderResponse = await response.json();
      console.log('Order created successfully:', orderResponse);

      setOrder(orderResponse);

      // If this is a guest order, save it to localStorage immediately
      if (isGuest) {
        console.log('💾 Saving guest order to localStorage immediately:', orderResponse);

        // Get existing guest orders from localStorage
        const existingGuestOrders = localStorage.getItem('guestOrders');
        let guestOrders = [];

        if (existingGuestOrders) {
          try {
            guestOrders = JSON.parse(existingGuestOrders);
          } catch (error) {
            console.error('Error parsing existing guest orders:', error);
            guestOrders = [];
          }
        }

        // Check if this order already exists in the array
        const orderExists = guestOrders.some(existingOrder => existingOrder.id === orderResponse.id);

        if (!orderExists) {
          // Add the new order to the beginning of the array
          guestOrders.unshift(orderResponse);

          // Keep only the last 10 orders to prevent localStorage from getting too large
          if (guestOrders.length > 10) {
            guestOrders = guestOrders.slice(0, 10);
          }

          // Save back to localStorage
          localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
          console.log(`✅ Saved guest order ${orderResponse.order_number} to localStorage`);
        }
      }

      // Clear cart after successful order
      clearCart();

      // Navigate to order success page
      navigate('/order-success', {
        state: {
          order: orderResponse,
          fromConfirmation: true,
          isGuestOrder: isGuest
        }
      });

    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToShipping = () => {
    navigate('/shipping-address');
  };

  const handleProceedToPayment = () => {
    navigate('/payment', {
      state: {
        orderPreview: orderPreview,
        isPreview: true
      }
    });
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentSelection(false);
  };

  // Credit card validation functions
  const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleaned);
  };

  const validateExpiryDate = (expiryDate) => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(expiryDate)) return false;

    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (parseInt(year) < currentYear) return false;
    if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return false;

    return true;
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateCardholderName = (name) => {
    return name.trim().length >= 2;
  };

  const validateCardForm = () => {
    const errors = {};

    if (!validateCardNumber(cardDetails.cardNumber)) {
      errors.cardNumber = 'Please enter a valid card number (13-19 digits)';
    }

    if (!validateExpiryDate(cardDetails.expiryDate)) {
      errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!validateCVV(cardDetails.cvv)) {
      errors.cvv = 'Please enter a valid CVV (3-4 digits)';
    }

    if (!validateCardholderName(cardDetails.cardholderName)) {
      errors.cardholderName = 'Please enter the cardholder name';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      if (cleaned.length <= 19) {
        formattedValue = cleaned.replace(/(.{4})/g, '$1 ').trim();
      }
    }

    // Format expiry date
    if (field === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 4) {
        if (cleaned.length >= 2) {
          formattedValue = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        } else {
          formattedValue = cleaned;
        }
      }
    }

    // Limit CVV to 4 digits
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear error when user starts typing
    if (cardErrors[field]) {
      setCardErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleConfirmOrder = () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method first');
      return;
    }

    // Validate credit card form if card payment is selected
    if (selectedPaymentMethod === 'card') {
      if (!validateCardForm()) {
        setError('Please fill in all credit card details correctly');
        return;
      }
    }

    handlePlaceOrder();
  };

  if (!orderPreview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {orderId ? `Order #${orderId}` : 'Order Confirmation'}
              </h1>
              <p className="text-gray-600 mt-1">
                {orderId ? 'View your order details' : 'Review your order details before placing'}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircleIcon className="h-6 w-6" />
              <span className="font-medium">
                {orderId ? 'Order Details' : showPaymentSelection ? 'Step 2 of 3' : 'Step 3 of 3'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {(orderId ? orderPreview?.items || [] : cartItems).map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="relative">
                      <img
                        src={item.previewImage || item.cake?.image || item.image}
                        alt={item.cake?.name || item.name || 'Cake'}
                        className="w-16 h-16 object-cover rounded-lg"
                        title={item.previewImage ? "Your customized cake preview" : "Standard cake image"}
                      />
                      {item.previewImage && (
                        <div className="absolute -top-1 -right-1 bg-sweetbite-500 text-white text-xs px-1 py-0.5 rounded-full">
                          ✨
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.cake?.name || item.name || 'Unknown Item'}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Customizations:</p>
                          <div className="text-sm text-gray-600">
                            {Object.entries(item.customizations).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {Array.isArray(value) ? value.join(', ') : value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">RS {Number(item.unit_price || item.price || 0).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">× {item.quantity}</p>
                      <p className="text-xs text-gray-500">Total: RS {Number(item.total_price || (item.unit_price || item.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <TruckIcon className="h-5 w-5 mr-2" />
                Delivery Address
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  {orderPreview?.shipping_address?.first_name || 'N/A'} {orderPreview?.shipping_address?.last_name || ''}
                </p>
                <p className="text-gray-600">{orderPreview?.shipping_address?.address_line1 || 'N/A'}</p>
                {orderPreview?.shipping_address?.address_line2 && (
                  <p className="text-gray-600">{orderPreview.shipping_address.address_line2}</p>
                )}
                <p className="text-gray-600">
                  {orderPreview?.shipping_address?.city || 'N/A'}, {orderPreview?.shipping_address?.state || 'N/A'} {orderPreview?.shipping_address?.postal_code || 'N/A'}
                </p>
                {orderPreview?.shipping_address?.country && (
                  <p className="text-gray-600">{orderPreview.shipping_address.country}</p>
                )}
                <p className="text-gray-600">Phone: {orderPreview?.shipping_address?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XMarkIcon className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>RS {Number(orderPreview?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>RS {Number(orderPreview?.delivery_fee || 0).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>RS {Number(orderPreview?.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {orderId ? (
                  // Viewing existing order - show different buttons
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                        <div>
                          <p className="text-green-800 font-medium">Order #{orderId}</p>
                          <p className="text-green-600 text-sm">Status: {order?.order_status || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/orders')}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center"
                    >
                      <TruckIcon className="h-5 w-5 mr-2" />
                      Back to My Orders
                    </button>

                    {order?.order_status === 'out_for_delivery' && (
                      <button
                        onClick={() => navigate(`/track-order/${orderId}`)}
                        className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                      >
                        <TruckIcon className="h-5 w-5 mr-2" />
                        Track Order
                      </button>
                    )}
                  </>
                ) : (
                  // Creating new order - show payment selection first, then order confirmation
                  <>
                    {showPaymentSelection ? (
                      // Step 1: Payment Method Selection
                      <>
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold mb-3">Select Payment Method</h3>
                          <div className="space-y-2">
                            <button
                              onClick={() => handlePaymentMethodSelect('cash')}
                              className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${selectedPaymentMethod === 'cash'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                            >
                              <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center">
                                  {selectedPaymentMethod === 'cash' && (
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  )}
                                </div>
                                <span className="font-medium">Cash on Delivery</span>
                              </div>
                            </button>

                            <button
                              onClick={() => handlePaymentMethodSelect('card')}
                              className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${selectedPaymentMethod === 'card'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                            >
                              <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center">
                                  {selectedPaymentMethod === 'card' && (
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  )}
                                </div>
                                <CreditCardIcon className="h-5 w-5 mr-2" />
                                <span className="font-medium">Credit/Debit Card</span>
                              </div>
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (selectedPaymentMethod) {
                              setShowPaymentSelection(false);
                            } else {
                              setError('Please select a payment method');
                            }
                          }}
                          disabled={!selectedPaymentMethod}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${selectedPaymentMethod
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          <CreditCardIcon className="h-5 w-5 mr-2" />
                          Continue to Order Confirmation
                        </button>
                      </>
                    ) : (
                      // Step 2: Order Confirmation
                      <>
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                            <div>
                              <p className="text-blue-800 font-medium">Payment Method Selected</p>
                              <p className="text-blue-600 text-sm">
                                {selectedPaymentMethod === 'cash' ? 'Cash on Delivery' : 'Credit/Debit Card'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Credit Card Form - Only show if card payment is selected */}
                        {selectedPaymentMethod === 'card' && (
                          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                            <h4 className="text-lg font-semibold mb-4 text-gray-900">Credit Card Details</h4>
                            <div className="space-y-4">
                              {/* Card Number */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Card Number *
                                </label>
                                <input
                                  type="text"
                                  placeholder="1234 5678 9012 3456"
                                  value={cardDetails.cardNumber}
                                  onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {cardErrors.cardNumber && (
                                  <p className="text-red-500 text-xs mt-1">{cardErrors.cardNumber}</p>
                                )}
                              </div>

                              {/* Cardholder Name */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Cardholder Name *
                                </label>
                                <input
                                  type="text"
                                  placeholder="John Doe"
                                  value={cardDetails.cardholderName}
                                  onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardErrors.cardholderName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {cardErrors.cardholderName && (
                                  <p className="text-red-500 text-xs mt-1">{cardErrors.cardholderName}</p>
                                )}
                              </div>

                              {/* Expiry Date and CVV */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiry Date *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardDetails.expiryDate}
                                    onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                      }`}
                                  />
                                  {cardErrors.expiryDate && (
                                    <p className="text-red-500 text-xs mt-1">{cardErrors.expiryDate}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CVV *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="123"
                                    value={cardDetails.cvv}
                                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardErrors.cvv ? 'border-red-500' : 'border-gray-300'
                                      }`}
                                  />
                                  {cardErrors.cvv && (
                                    <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>
                                  )}
                                </div>
                              </div>

                              {/* Security Note */}
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 text-sm">
                                  <span className="font-medium">🔒 Secure Payment:</span> Your card details are encrypted and secure. We do not store your card information.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleConfirmOrder}
                          disabled={isSubmitting}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${isSubmitting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Placing Order...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-5 w-5 mr-2" />
                              Confirm & Place Order
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setShowPaymentSelection(true);
                            // Clear card details when changing payment method
                            setCardDetails({
                              cardNumber: '',
                              expiryDate: '',
                              cvv: '',
                              cardholderName: ''
                            });
                            setCardErrors({});
                          }}
                          className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                          Change Payment Method
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleBackToShipping}
                      className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Back to Shipping
                    </button>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Payment will be collected upon delivery
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrderConfirmationPage;
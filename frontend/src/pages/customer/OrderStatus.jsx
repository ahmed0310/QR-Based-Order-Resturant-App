import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Check, Clock, ChefHat, UtensilsCrossed, Home } from 'lucide-react';
import { apiUrl } from '../../utils/api';

const OrderStatus = () => {
  const { orderId, phoneNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch order status
  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`${apiUrl('/api/order')}/${orderId}/status?phone=${phoneNumber}`);
      
      if (!response.ok) {
        throw new Error('Order not found or phone number doesn\'t match');
      }

      const data = await response.json();
      setOrder(data);
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      console.error('Fetch order error:', err);
      setError(err.message || 'Unable to fetch order status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchOrderStatus, 5000);
    
    return () => clearInterval(interval);
  }, [orderId, phoneNumber]);

  const getStatusSteps = () => [
    { 
      status: 'pending', 
      label: 'Order Received', 
      icon: Clock,
      description: 'Your order is being confirmed'
    },
    { 
      status: 'confirmed', 
      label: 'Confirmed', 
      icon: Check,
      description: 'Order confirmed, getting ready'
    },
    { 
      status: 'preparing', 
      label: 'Preparing', 
      icon: ChefHat,
      description: 'Chef is preparing your order'
    },
    { 
      status: 'ready', 
      label: 'Ready', 
      icon: UtensilsCrossed,
      description: 'Your order is ready to serve'
    },
    { 
      status: 'completed', 
      label: 'Completed', 
      icon: Check,
      description: 'Order completed'
    }
  ];

  const getStatusIndex = () => {
    if (!order) return -1;
    const steps = getStatusSteps();
    return steps.findIndex(step => step.status === order.status);
  };

  const statusIndex = getStatusIndex();
  const steps = getStatusSteps();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading your order status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <h1 className="text-3xl font-bold text-gray-900">{order?.orderNumber || 'N/A'}</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full font-semibold ${
              order?.status === 'completed' ? 'bg-green-100 text-green-700' :
              order?.status === 'ready' ? 'bg-blue-100 text-blue-700' :
              order?.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1) || 'Unknown'}
            </div>
            <p className="text-sm text-gray-600">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-8">Order Progress</h2>
          
          <div className="space-y-6">
            {steps.map((step, index) => {
              const isCompleted = index <= statusIndex;
              const isCurrent = index === statusIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.status} className="relative">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute left-6 top-16 w-1 h-12 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}

                  {/* Step */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isCurrent ? 'bg-blue-600 ring-4 ring-blue-200 scale-110' :
                      isCompleted ? 'bg-green-500' :
                      'bg-gray-300'
                    }`}>
                      <StepIcon className={`w-6 h-6 ${
                        isCurrent || isCompleted ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>

                    <div className="pt-1 flex-1">
                      <h3 className={`font-bold text-lg mb-1 ${
                        isCurrent ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>

                    {isCurrent && (
                      <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        In Progress
                      </div>
                    )}
                    {isCompleted && !isCurrent && (
                      <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Items */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Items</h2>
            
            <div className="space-y-3">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-900 ml-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">${order?.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold text-gray-900">$0.00</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">${order?.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Contact Info</h3>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Phone:</span> {order?.customerPhone}
              </p>
              {order?.tableNo && (
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-medium">Table:</span> {order.tableNo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Auto-refresh Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Status updates automatically every 5 seconds
          </p>
          {order?.status === 'completed' && (
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                ✓ Order Complete!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;

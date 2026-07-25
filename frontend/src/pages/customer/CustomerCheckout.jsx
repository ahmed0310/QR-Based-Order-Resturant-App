import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, FileText, ArrowLeft, Check, Loader2, Info } from 'lucide-react';
import { apiUrl } from '../../utils/api';

const CustomerCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { shopId, tableId } = useParams();
  
  const cart = location.state?.cart || [];
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    customerPhone: '',
  });

  const [errors, setErrors] = useState({});

  // Redirect if cart is empty
  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Please add items to your cart first</p>
          <button
            onClick={() => navigate(`/customer/menu/${shopId}/${tableId}`)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        shopId,
        tableId,
        customerPhone: formData.customerPhone,
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity
        }))
      };

      const response = await fetch(apiUrl('/api/order/qr'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create order');
      }

      setOrderDetails(data);
      setOrderSuccess(true);

    } catch (err) {
      alert(err.message || 'Failed to place order. Please try again.');
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Success Screen - Redirect to Order Status
  if (orderSuccess && orderDetails) {
    setTimeout(() => {
      navigate(`/customer/order-status/${orderDetails.orderId}/${formData.customerPhone}`, { replace: true });
    }, 2000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white border border-green-200 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-6">Your order has been received and is being prepared</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-bold text-gray-900">{orderDetails.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-blue-600 text-xl">${orderDetails.totalAmount?.toFixed(2) || getTotalAmount()}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">Redirecting to order status...</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
        </div>
      </div>
    );
  }

  // Order Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/customer/menu/${shopId}/${tableId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Complete Your Order</h1>
              <p className="text-sm text-gray-600">Enter your phone number to confirm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Phone Number</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number *
                </label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="Enter your 10-digit phone number"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg ${
                    errors.customerPhone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-600 mt-2">{errors.customerPhone}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">We'll use this to track your order status</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-start py-3 border-b border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      {item.isVeg ? (
                        <span className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        </span>
                      ) : (
                        <span className="w-4 h-4 border-2 border-red-600 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900 ml-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">${getTotalAmount()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Tax:</span>
                <span className="font-semibold text-gray-900">$0.00</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-3xl font-bold text-blue-600">${getTotalAmount()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What Happens Next?</h3>
              <p className="text-sm text-gray-700">
                After placing your order, you can track its status in real-time. Your order will move through stages: 
                <span className="font-medium"> Pending → Preparing → Ready → Completed</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCheckout;

# Customer Table-Based QR Ordering System - Complete Guide

## Overview

The customer table-based QR ordering system allows restaurant patrons to:
1. Scan a QR code placed on their table
2. View the restaurant menu organized by categories
3. Add items to cart and review the order
4. Enter their phone number to place the order
5. Track their order status in real-time

## Customer Journey

### Step 1: Scan QR Code
- Customer scans the printed QR code on their table
- Browser automatically opens the app with QR code identifier

### Step 2: QR Landing & Auto-Redirect
- Route: `/table/:qrCode`
- Component: `QRLanding.jsx`
- Fetches table information from QR code
- Validates QR code and retrieves:
  - Table ID
  - Shop ID
  - Table name & capacity
- Auto-redirects to customer menu page

### Step 3: Browse Menu
- Route: `/customer/menu/:shopId/:tableId`
- Component: `CustomerMenu.jsx`
- Displays:
  - **Table Info Bar**: Shows table name and capacity
  - **Menu Items**: Organized by categories (drinks, starters, mains, desserts, snacks, combos)
  - **Category Filter**: Quick navigation between categories
  - **Cart Sidebar**: Shows selected items with quantities and total price

### Step 4: Checkout
- Route: `/customer/checkout/:shopId/:tableId`
- Component: `CustomerCheckout.jsx`
- Features:
  - **Phone Number Input**: Required for order tracking
  - **Order Summary**: Lists all items with prices
  - **Validation**: 10-digit phone number format
  - **Submission**: Creates order with `tableId` reference

### Step 5: Order Status Tracking
- Route: `/customer/order-status/:orderId/:phoneNumber`
- Component: `OrderStatus.jsx`
- Real-time status updates every 5 seconds
- Displays:
  - **Order Number**: Unique identifier
  - **Status Timeline**: Visual representation of order progress
  - **Items List**: All ordered items with quantities and prices
  - **Current Status**: With progress indicator

## Order Status States

```
pending       → Order received, waiting to be confirmed
              ↓
confirmed     → Kitchen confirmed the order
              ↓
preparing     → Chef is actively preparing the order
              ↓
ready         → Order is ready for pickup/delivery
              ↓
completed     → Customer received the order
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Get Table by QR Code
```
GET /api/shop/table/qr/:qrCode

Response:
{
  "_id": "table_mongo_id",
  "tableNumber": "1",
  "name": "Table 1",
  "capacity": 4,
  "shopId": "shop_mongo_id",
  "qrCode": "uuid-string",
  "status": "active"
}
```

#### 2. Create QR Order
```
POST /api/order/qr

Request Body:
{
  "shopId": "shop_mongo_id",
  "tableId": "table_mongo_id",
  "customerPhone": "9876543210",
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ]
}

Response:
{
  "msg": "Order Created Successfully",
  "orderId": "order_mongo_id",
  "orderNumber": 1001,
  "totalAmount": 150.50
}
```

#### 3. Get Order Status (Customer Tracking)
```
GET /api/order/:orderId/status?phone=9876543210

Response:
{
  "_id": "order_mongo_id",
  "orderNumber": 1001,
  "status": "preparing",
  "items": [
    {
      "productId": "prod_id",
      "name": "Biryani",
      "price": 250,
      "quantity": 1,
      "isVeg": false
    }
  ],
  "totalAmount": 250,
  "customerPhone": "9876543210",
  "tableNo": "1",
  "createdAt": "2024-07-24T10:30:00Z",
  "updatedAt": "2024-07-24T10:45:00Z"
}
```

## File Structure

### Backend Files
```
backend/
├── controllers/
│   └── orderController.js          (Updated: getOrderStatus, createQrOrder with tableId)
├── routes/
│   └── orderRoutes.js              (Updated: added /api/order/:orderId/status route)
└── models/
    └── Order.js                    (Already has tableId field)
```

### Frontend Files
```
frontend/src/
├── pages/
│   └── customer/
│       ├── QRLanding.jsx           (✓ New - QR redirect page)
│       ├── CustomerMenu.jsx        (✓ New - Browse menu with cart)
│       ├── CustomerCheckout.jsx    (✓ New - Place order page)
│       └── OrderStatus.jsx         (✓ New - Real-time status tracking)
├── App.jsx                         (Updated: Added customer routes)
└── utils/
    └── api.js                      (Already has APP_BASE export)
```

## How to Use

### For Customers

1. **Scan QR Code**
   - Use phone camera or QR scanner app
   - Opens to `/table/:qrCode`

2. **View Menu**
   - Browse categories (scrollable list)
   - Click items to see details
   - Tap "Add" to add to cart

3. **Manage Cart**
   - Tap "Cart" button in header
   - Adjust quantities with +/- buttons
   - Remove items with trash icon
   - See live total amount

4. **Checkout**
   - Tap "Proceed to Checkout"
   - Enter 10-digit phone number
   - Review order summary
   - Tap "Place Order"

5. **Track Order**
   - See confirmation with order number
   - Auto-redirects to status page
   - Watch status update in real-time
   - See timeline of order progress

### For Restaurant Staff

#### Setup (Admin)
1. Go to Shop Admin → Tables
2. Create table with:
   - Table Name (e.g., "Table 1")
   - Table Number (e.g., "1")
   - Capacity (e.g., "4")
3. System generates unique QR code
4. Download/print QR code
5. Place printed QR code on table

#### Monitor Orders
1. Go to Shop Admin → Dashboard
2. View all active orders
3. Update order status as it progresses:
   - Click order → Change status
   - Status flow: pending → confirmed → preparing → ready → completed

## Data Model

### Order Document (Updated)
```javascript
{
  _id: ObjectId,
  shopId: ObjectId,          // Reference to shop
  tableId: ObjectId,         // NEW: Reference to table (for queries)
  tableNo: String,           // Legacy field, kept for compatibility
  orderNumber: Number,       // Auto-incrementing
  items: [
    {
      productId: ObjectId,
      name: String,
      price: Number,
      quantity: Number,
      isVeg: Boolean
    }
  ],
  totalAmount: Number,
  customerPhone: String,     // For verification
  status: String,            // pending, confirmed, preparing, ready, completed
  paymentStatus: String,     // pending, completed, failed
  orderSource: String,       // "qr"
  createdAt: Date,
  updatedAt: Date
}
```

## Features

### ✓ Complete Customer Journey
- Scan QR → Menu → Cart → Checkout → Tracking

### ✓ Real-Time Updates
- Order status polls every 5 seconds
- Visual progress indicator
- Timeline display

### ✓ Phone Verification
- All order tracking requires phone number
- Prevents unauthorized access to order details

### ✓ Responsive Design
- Mobile-first approach
- Works on all devices
- Large touch targets for restaurant environment

### ✓ Visual Feedback
- Status badges with colors
- Progress timeline with icons
- Success/error notifications
- Loading states

## Testing Guide

### Test Scenario 1: Complete Order Flow
1. Print QR code for a table
2. Scan with phone
3. Select items (e.g., 1 Biryani + 2 Colas)
4. Proceed to checkout
5. Enter phone number: 9876543210
6. Place order
7. Verify:
   - Order created successfully
   - Order number displayed
   - Redirected to order status page

### Test Scenario 2: Real-Time Status Updates
1. Place order as per above
2. Let tracking page open
3. From admin panel, update order status
4. Within 5 seconds, see status change on customer page
5. Verify all status transitions work

### Test Scenario 3: Phone Verification
1. Place an order with phone 9876543210
2. Note the order ID
3. Go directly to order status URL with different phone
4. Should get "Order not found or phone number doesn't match"
5. Use correct phone - order displays

## Frontend Routes Summary

```
/table/:qrCode
└─ QRLanding (loads table, redirects to menu)

/customer/menu/:shopId/:tableId
└─ CustomerMenu (browse & cart)

/customer/checkout/:shopId/:tableId
└─ CustomerCheckout (place order)

/customer/order-status/:orderId/:phoneNumber
└─ OrderStatus (tracking)
```

## API Testing with cURL

```bash
# 1. Create Order
curl -X POST http://localhost:5000/api/order/qr \
  -H "Content-Type: application/json" \
  -d '{
    "shopId": "shop_id_here",
    "tableId": "table_id_here",
    "customerPhone": "9876543210",
    "items": [
      {"productId": "prod_id", "quantity": 1}
    ]
  }'

# 2. Check Order Status
curl "http://localhost:5000/api/order/order_id_here/status?phone=9876543210"

# 3. Get Table by QR
curl "http://localhost:5000/api/shop/table/qr/qr_code_uuid"
```

## Troubleshooting

### Issue: QR code not working
**Solution**: Verify QR code UUID matches table document in database

### Issue: Order not found on status page
**Solution**: Verify phone number matches exactly (10 digits)

### Issue: Status not updating
**Solution**: Check admin panel order status, verify request body in API

### Issue: Cart empty on checkout
**Solution**: Ensure state is passed via navigation, check browser console for errors

## Future Enhancements

1. **WebSocket Updates** - Replace polling with WebSocket for instant updates
2. **Estimated Time** - Show "~15 mins" for order completion
3. **Special Requests** - Add notes/special instructions field
4. **Multiple Tables** - Support for family/group orders across tables
5. **Loyalty Integration** - Reward points tracking
6. **Payment Integration** - Accept online/card payments at table

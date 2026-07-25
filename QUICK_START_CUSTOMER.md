# Quick Start - Customer Ordering System

## 🎯 What's New?

Your restaurant app now has a complete customer-facing QR ordering system! Customers can scan table QR codes and order directly from their phones.

## 📱 Customer Flow (30 seconds)

```
Scan QR on table
    ↓
See menu with table info
    ↓
Add items to cart
    ↓
Enter phone number
    ↓
Place order
    ↓
Track order status in real-time
```

## 🚀 Getting Started

### 1. For Admin/Restaurant Staff

#### Create Tables
1. Login to Shop Admin
2. Go to **Sidebar → Tables**
3. Click **Add Table**
4. Fill:
   - Table Name: "Table 1"
   - Table Number: "1"
   - Capacity: "4"
5. Click **Save**
6. System generates QR code automatically

#### Print QR Codes
1. Go to **Sidebar → QR Code**
2. You'll see grid of all table QR codes
3. Click **Download** to save as image
4. Print and place on each table

#### Monitor Orders
1. Go to **Dashboard** or **Orders**
2. See list of all orders
3. Click order to view details
4. Change status: `pending → confirmed → preparing → ready → completed`
5. Customers see updates in real-time!

### 2. For Customers

#### Scan & Order
1. Point phone camera at table QR code
2. Tap notification or browser popup
3. App opens showing:
   - Table name ("Table 1")
   - Table capacity ("4 people")
4. Browse menu by category
5. Tap items to add to cart
6. Tap **Cart** button to see total
7. Tap **Proceed to Checkout**
8. Enter 10-digit phone number
9. Tap **Place Order**

#### Track Order
1. After placing order, see confirmation
2. App shows:
   - Order number
   - Total amount
3. Automatically opens tracking page showing:
   - Order progress timeline
   - Current status
   - All items ordered
4. Status updates every 5 seconds automatically!

## 📋 URLs Reference

### Customer Links (Share with customers)

After creating tables, customers can access:
- **Scan QR**: Opens `/table/:qrCode`
- **Direct Menu**: `http://yourapp.com/customer/menu/[shopId]/[tableId]`

### Admin Links

- **Admin Dashboard**: `/shop/dashboard`
- **Manage Tables**: `/shop/tables`
- **Print QR Codes**: `/shop/qr-code`
- **View Orders**: Check Dashboard for orders section

## 🎨 UI Changes

### New Pages Created
1. **QRLanding** - Auto-redirect from QR scan
2. **CustomerMenu** - Browse menu with table info
3. **CustomerCheckout** - Simple phone number entry
4. **OrderStatus** - Real-time order tracking

### What's Different
- No user authentication needed
- Phone number for verification only
- Real-time status updates
- Visual status timeline

## ⚙️ How Status Updates Work

Order status flow:

```
pending        When customer places order
    ↓
confirmed      When staff confirms receipt
    ↓
preparing      When kitchen starts preparing
    ↓
ready          When order is ready to serve
    ↓
completed      When customer receives order
```

**Important**: Customer sees updates every 5 seconds automatically!

## 🔧 Technical Details

### New API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/order/qr` | Create QR order |
| GET | `/api/order/:orderId/status?phone=xxx` | Get order status |
| GET | `/api/shop/table/qr/:qrCode` | Get table by QR code |

### New Frontend Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/table/:qrCode` | QRLanding | Auto-redirect from QR |
| `/customer/menu/:shopId/:tableId` | CustomerMenu | Browse & order |
| `/customer/checkout/:shopId/:tableId` | CustomerCheckout | Place order |
| `/customer/order-status/:orderId/:phone` | OrderStatus | Track order |

## 🐛 Testing Checklist

- [ ] Create a table with QR code
- [ ] Print QR code and place on table
- [ ] Scan QR with phone
- [ ] Verify table info displays
- [ ] Add 2-3 items to cart
- [ ] Verify cart total updates
- [ ] Proceed to checkout
- [ ] Enter phone number (10 digits)
- [ ] Place order
- [ ] See order confirmation
- [ ] Check order appears in admin
- [ ] Update order status in admin
- [ ] Verify customer sees status change within 5 seconds

## ❓ Common Issues & Solutions

### "Invalid QR code"
- Check QR code was generated for the table
- Verify table exists in database

### "Order not found"
- Verify phone number matches exactly
- Ensure order was created successfully

### "Status not updating"
- Refresh the page
- Check admin panel for status changes
- Wait up to 5 seconds for auto-refresh

### Cart empty on checkout
- Go back to menu
- Re-add items
- Try again

## 📞 Phone Number Format

- Must be exactly 10 digits
- Numbers only (no dashes or spaces)
- Examples: 9876543210, 8765432109

## 💡 Pro Tips

1. **Customize Table Names**: Use "Window Seat", "Corner Table" instead of just numbers
2. **Print Multiple QRs**: Laminate QR codes for durability
3. **Test Orders**: Place test orders before opening
4. **Monitor Dashboard**: Keep eye on pending orders

## 🎉 You're All Set!

Your restaurant now has a complete mobile ordering system! 

Key features:
- ✅ Customers scan QR codes
- ✅ Real-time order tracking  
- ✅ Visual status updates
- ✅ No login required
- ✅ Phone-based verification

Start by creating a few tables, printing QR codes, and testing the flow!

---

**Need help?** Check `CUSTOMER_QR_ORDERING_GUIDE.md` for detailed documentation.

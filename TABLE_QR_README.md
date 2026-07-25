# Table-Based QR Code System Documentation

## Quick Start

### Prerequisites
- Node.js and npm installed
- MongoDB running locally or remote connection string

### Installation & Setup

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure MONGO_URI and JWT_SECRET
npm run dev
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and backend API at `http://localhost:5000`.

## Features

### 1. Table Management (Admin)
- **Create Tables**: Add new tables with name, number, and capacity
- **Edit Tables**: Update table information
- **Delete Tables**: Remove tables from the system
- **View Tables**: See all tables in your restaurant with status

### 2. QR Code Generation
- **Unique QR Codes**: Each table gets an automatically generated UUID
- **Download**: Export QR codes as PNG files for printing
- **Print**: Print QR codes directly from the browser
- **Copy URL**: Share table-specific menu links via URL
- **Status Tracking**: Monitor which tables are available or occupied

### 3. Customer Experience
- **Scan QR**: Customers scan the table-specific QR code
- **Table-Specific Menu**: Direct link to menu with table information
- **Auto Table Assignment**: Orders automatically associated with correct table
- **Seamless Ordering**: No need to enter table number manually

## Architecture

### Database Schema

#### Table Collection
```javascript
{
  name: String,              // e.g., "Table 1"
  tableNumber: Number,       // Numeric identifier
  shopId: ObjectId,          // Reference to Shop
  capacity: Number,          // Number of seats
  status: String,            // "available" or "occupied"
  qrCode: String,            // Unique UUID
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Collection (Updated)
```javascript
{
  // ... existing fields
  tableNo: String,           // Legacy field (kept for compatibility)
  tableId: ObjectId,         // New field - reference to Table
  // ... other fields
}
```

### API Endpoints

#### Admin Routes (Protected - Requires Authentication)

**Create Table**
```
POST /api/shop/tables
Body: {
  name: "Table 1",
  tableNumber: 1,
  capacity: 4
}
Response: {
  msg: "Table Created ✅",
  table: { _id, name, tableNumber, shopId, capacity, status, qrCode, createdAt, updatedAt }
}
```

**Get All Tables**
```
GET /api/shop/tables
Response: [ { table objects } ]
```

**Get Table Details**
```
GET /api/shop/tables/:id
Response: { table object }
```

**Update Table**
```
PUT /api/shop/tables/:id
Body: { name?, tableNumber?, capacity?, status? }
Response: {
  msg: "Table Updated ✅",
  table: { updated table object }
}
```

**Delete Table**
```
DELETE /api/shop/tables/:id
Response: { msg: "Table Deleted ✅" }
```

#### Public Routes

**Get Table by QR Code** (No authentication required)
```
GET /api/shop/table/qr/:qrCode
Response: { table object }
```

## Frontend Components

### Pages

#### 1. **ManageTables** (`/shop/tables`)
Complete table management dashboard:
- Table list with add/edit/delete functionality
- Modal form for creating and editing tables
- Table status indicators
- QR code ID display
- Empty state with helpful message

#### 2. **Updated QRCode** (`/shop/qr-code`)
Enhanced QR code page:
- Grid layout showing each table's QR code
- Download individual table QRs
- Print functionality
- Copy QR URL to clipboard
- Table status and information
- Best practices tips section

### Navigation

Added "Tables" menu item to shop admin sidebar with Layers icon.

## Usage Workflow

### For Restaurant Admins

1. **Login** to shop admin dashboard
2. **Navigate** to "Tables" section
3. **Create Tables**:
   - Click "Add Table" button
   - Enter table name (e.g., "Table 1", "Window Seat")
   - Enter table number (numeric: 1, 2, 3, etc.)
   - Enter capacity (number of seats)
   - Click "Create"
4. **Manage QR Codes**:
   - Go to "QR Code" page
   - View all table QR codes in grid layout
   - Download QR codes for each table
   - Print QR codes for placement at tables
5. **Edit/Delete**:
   - Click "Edit" to modify table info
   - Click "Delete" to remove table (with confirmation)

### For Customers

1. **Find** QR code at their table
2. **Scan** with mobile device
3. **Redirected** to table-specific menu page
4. **Browse** menu items and place order
5. **Order** automatically associated with their table

## QR Code Details

### QR Code Structure
Each QR code encodes the following URL:
```
http://localhost:5173/menu/{shopId}/table/{qrCode}
```

Where:
- `shopId`: The restaurant's ID
- `qrCode`: The unique UUID for the specific table

### QR Code Generation
- Uses `qrcode.react` library for frontend generation
- Each table gets a unique UUID upon creation
- QR codes can be regenerated but table association remains

## Error Handling

### Validation
- **Duplicate Table Numbers**: System prevents creating two tables with same number in same shop
- **Required Fields**: All fields (name, number, capacity) are required
- **Authorization**: Only authenticated shop admins can manage tables
- **Table Not Found**: Proper 404 handling for missing tables

### User Feedback
- Success messages after CRUD operations
- Error alerts for validation failures
- Confirmation dialogs before deletion
- Auto-clearing notifications after 3 seconds

## Performance Considerations

### Indexes
- `shopId`: Fast shop lookup
- `qrCode`: Quick QR code resolution
- `(shopId, tableNumber)`: Unique compound index for duplication prevention

### Optimization Tips
1. Load tables once on component mount
2. Cache table list in parent component
3. Use pagination for restaurants with 100+ tables (future)
4. Batch download all QR codes as ZIP (future)

## Security

### Authorization
- All admin table operations require authentication token
- Public QR lookup is read-only (table info only)
- No sensitive shop data exposed via public endpoints

### Best Practices
- Use HTTPS in production
- Store JWT secrets securely
- Implement rate limiting for QR lookup API
- Validate all user inputs server-side

## File Structure

```
project/
├── backend/
│   ├── models/
│   │   ├── Table.js (NEW)
│   │   └── Order.js (MODIFIED)
│   ├── controllers/
│   │   └── shopController.js (MODIFIED - added table functions)
│   ├── routes/
│   │   └── shopRoutes.js (MODIFIED - added table routes)
│   ├── config/
│   │   └── db.js
│   ├── .env (NEW)
│   ├── package.json (MODIFIED - added uuid)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── shop/
│   │   │       ├── ManageTables.jsx (NEW)
│   │   │       └── QRCode.jsx (MODIFIED)
│   │   ├── components/
│   │   │   └── ShopLayout.jsx (MODIFIED)
│   │   ├── App.jsx (MODIFIED)
│   │   └── utils/
│   │       └── api.js
│   ├── .env (NEW)
│   └── package.json (MODIFIED - added qrcode.react)
└── IMPLEMENTATION_SUMMARY.md
```

## Testing

### Backend Testing (with curl or Postman)

1. **Create Table**
```bash
curl -X POST http://localhost:5000/api/shop/tables \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Table 1",
    "tableNumber": 1,
    "capacity": 4
  }'
```

2. **List Tables**
```bash
curl http://localhost:5000/api/shop/tables \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Get Table by QR Code**
```bash
curl http://localhost:5000/api/shop/table/qr/{qrCodeUUID}
```

### Frontend Testing

1. Login to shop admin dashboard
2. Navigate to "Tables" menu item
3. Add a table using the form
4. Verify table appears in list
5. Go to "QR Code" page
6. Verify QR code displays
7. Test download and print functionality
8. Try editing and deleting a table

## Common Issues & Solutions

### Issue: QR Code not appearing
**Solution**: Ensure `qrcode.react` is installed and imported correctly

### Issue: Table not found when creating order
**Solution**: Make sure tableId is being passed in order creation request

### Issue: Duplicate table number error
**Solution**: Check existing table numbers in the system; each shop can only have one table per number

### Issue: Authorization errors on table endpoints
**Solution**: Verify JWT token is valid and included in Authorization header

## Future Enhancements

1. **Batch Operations**
   - Download all QR codes as ZIP file
   - Bulk table upload via CSV

2. **Advanced Table Management**
   - Table sections/zones
   - Seating arrangements visualization
   - Waiter assignment

3. **Analytics**
   - Table usage statistics
   - Peak occupancy times
   - Table-specific sales reports

4. **Mobile App**
   - Native mobile app for table management
   - Real-time table status updates
   - Quick order assignment

5. **Customization**
   - Custom QR code styling with logo
   - Color-coded table types
   - Custom table numbering schemes

6. **Integration**
   - POS system integration
   - Kitchen display system (KDS) integration
   - Payment processing per table

## Support

For issues or questions about the table-based QR system, please refer to the IMPLEMENTATION_SUMMARY.md file or contact the development team.

## License

This implementation is part of the QR-Based Order Restaurant App and follows the same license terms.

import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Table from "../models/Table.js";
import Shop from "../models/Shop.js";

/**
 * Statuses a shop admin is allowed to set. "served" is intentionally excluded:
 * it is a legacy value that the model still accepts for existing documents,
 * but new transitions should use "completed" instead.
 */
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

/* ================================
   Create QR Order
================================ */
export const createQrOrder = async (req, res) => {
  try {
    const { shopId, tableId, tableNo, customerPhone, items } = req.body;

    if (!shopId || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({
        msg: "Invalid order data",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ msg: "Invalid shop id" });
    }

    if (tableId && !mongoose.Types.ObjectId.isValid(tableId)) {
      return res.status(400).json({ msg: "Invalid table id" });
    }

    const shop = await Shop.findById(shopId).select("_id status");
    if (!shop) {
      return res.status(404).json({ msg: "Shop not found" });
    }

    const normalizedPhone = String(customerPhone).replace(/\D/g, "");
    if (!/^[0-9]{10}$/.test(normalizedPhone)) {
      return res.status(400).json({ msg: "Please provide a valid 10-digit phone number" });
    }

    let orderItems = [];
    let totalAmount = 0;

    // Validate each product
    for (const item of items) {
      if (!item?.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ msg: "Invalid product in order" });
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ msg: "Each item must have a quantity of at least 1" });
      }

      const product = await Product.findOne({
        _id: item.productId,
        shopId,
        isAvailable: true,
      });

      if (!product) {
        return res.status(404).json({
          msg: "Product not found or unavailable",
        });
      }

      const orderItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        isVeg: product.isVeg,
      };

      totalAmount += product.price * quantity;

      orderItems.push(orderItem);
    }

    // Derive the human-readable table number from the table itself when the
    // client didn't supply one, so the dashboard and customer view can always
    // display "Table N" for QR orders.
    let resolvedTableNo = tableNo != null ? String(tableNo) : undefined;
    if (!resolvedTableNo && tableId) {
      const table = await Table.findOne({ _id: tableId, shopId }).select(
        "tableNumber"
      );
      if (table) resolvedTableNo = String(table.tableNumber);
    }

    const order = await Order.create({
      shopId,
      items: orderItems,
      totalAmount,
      tableId: tableId || undefined,
      tableNo: resolvedTableNo,
      customerPhone: normalizedPhone,
      orderSource: "qr",
      paymentStatus: "pending",
      status: "pending",
    });

    res.status(201).json({
      msg: "Order Created Successfully",
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
    });

  } catch (error) {
    console.error("Create QR Order Error:", error);
    res.status(500).json({
      msg: "Server Error",
    });
  }
};

/* ================================
   Get Shop Orders (Shop Admin)
================================ */
export const getShopOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      shopId: req.user.shopId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(orders);

  } catch (error) {
    console.error("Get Shop Orders Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Update Order Status (Shop Admin)
================================ */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        msg: `Invalid status. Must be one of: ${ORDER_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      shopId: req.user.shopId,
    });

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({
      msg: "Order Status Updated ✅",
      order,
    });

  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Get Order Status (Customer Tracking)
================================ */
export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        msg: "Phone number required for verification",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customerPhone: phone,
    });

    if (!order) {
      return res.status(404).json({
        msg: "Order not found or phone number doesn't match",
      });
    }

    res.json({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items,
      totalAmount: order.totalAmount,
      customerPhone: order.customerPhone,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      tableNo: order.tableNo,
      tableId: order.tableId,
    });

  } catch (error) {
    console.error("Get Order Status Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Get Dashboard Stats (Shop Admin)
================================ */
export const getDashboardStats = async (req, res) => {
  try {
    const shopId = req.user.shopId;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get week start date
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    // Today's orders and revenue
    const todayOrders = await Order.find({
      shopId,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = todayOrders.filter(order => order.status === 'pending').length;

    // Weekly revenue
    const weekOrders = await Order.find({
      shopId,
      createdAt: { $gte: weekStart },
    });

    const weeklyRevenue = weekOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Total orders
    const totalOrders = await Order.countDocuments({ shopId });

    res.json({
      todayRevenue,
      todayOrders: todayOrders.length,
      weeklyRevenue,
      totalOrders,
      pendingOrders,
    });

  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

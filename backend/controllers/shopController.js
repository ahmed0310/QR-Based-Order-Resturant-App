import mongoose from "mongoose";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import Table from "../models/Table.js";

/* ================================
   Add Product (Shop Admin)
================================ */
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      description,
      image,
      isVeg,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        msg: "Name, price and category are required",
      });
    }

    const product = await Product.create({
      name,
      price,
      category,
      description,
      image,
      isVeg,
      shopId: req.user.shopId,
      createdBy: req.user._id,
    });

    res.status(201).json({
      msg: "Product Added ✅",
      product,
    });

  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Update Product
================================ */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    Object.assign(product, req.body);

    await product.save();

    res.json({
      msg: "Product Updated ✅",
      product,
    });

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Delete Product
================================ */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    await product.deleteOne();

    res.json({ msg: "Product Deleted ✅" });

  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Get Shop Menu (Public)
================================ */
export const getShopMenu = async (req, res) => {
  try {
    const products = await Product.find({
      shopId: req.params.shopId,
      isAvailable: true,
    }).sort({ category: 1, name: 1 });

    res.json(products);

  } catch (error) {
    console.error("Get Menu Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Get All Products (Shop Admin)
================================ */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      shopId: req.user.shopId,
    }).sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Toggle Availability
================================ */
export const toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.json({
      msg: "Availability Updated ✅",
      isAvailable: product.isAvailable,
    });

  } catch (error) {
    console.error("Toggle Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Get Shop Profile (Shop Admin)
================================ */
export const getShopProfile = async (req, res) => {
  try {
    const shop = await Shop.findById(req.user.shopId);

    if (!shop) {
      return res.status(404).json({ msg: "Shop not found" });
    }

    res.json(shop);

  } catch (error) {
    console.error("Get Shop Profile Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Update Shop Profile (Shop Admin)
================================ */
export const updateShopProfile = async (req, res) => {
  try {
    const {
      name,
      ownerName,
      phone,
      address,
      description,
      openingTime,
      closingTime,
    } = req.body;

    const shop = await Shop.findById(req.user.shopId);

    if (!shop) {
      return res.status(404).json({ msg: "Shop not found" });
    }

    // Update allowed fields
    if (name) shop.name = name;
    if (ownerName) shop.ownerName = ownerName;
    if (phone) shop.phone = phone;
    if (address !== undefined) shop.address = address;
    if (description !== undefined) shop.description = description;
    if (openingTime !== undefined) shop.openingTime = openingTime;
    if (closingTime !== undefined) shop.closingTime = closingTime;

    await shop.save();

    res.json({
      msg: "Shop Profile Updated ✅",
      shop,
    });

  } catch (error) {
    console.error("Update Shop Profile Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Create Table
================================ */
export const createTable = async (req, res) => {
  try {
    const { name, tableNumber, capacity } = req.body;

    // Validation
    if (!name || !tableNumber || !capacity) {
      return res.status(400).json({
        msg: "Name, table number, and capacity are required",
      });
    }

    // Check if table number already exists for this shop
    const existingTable = await Table.findOne({
      shopId: req.user.shopId,
      tableNumber,
    });

    if (existingTable) {
      return res.status(400).json({
        msg: "Table number already exists for this shop",
      });
    }

    const table = await Table.create({
      name,
      tableNumber,
      capacity,
      shopId: req.user.shopId,
    });

    res.status(201).json({
      msg: "Table Created ✅",
      table,
    });

  } catch (error) {
    console.error("Create Table Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Get All Tables (Shop Admin)
================================ */
export const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find({
      shopId: req.user.shopId,
    }).sort({ tableNumber: 1 });

    res.json(tables);

  } catch (error) {
    console.error("Get Tables Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Get Table Details
================================ */
export const getTableDetails = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
    });

    if (!table) {
      return res.status(404).json({ msg: "Table not found" });
    }

    res.json(table);

  } catch (error) {
    console.error("Get Table Details Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Get Public Table By Id (Customer)
   Used by the QR ordering flow, which is anonymous and therefore cannot
   call the shop-admin protected getTableDetails route. Only non-sensitive
   fields are returned.
================================ */
export const getPublicTableById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid table id" });
    }

    const table = await Table.findById(id).select(
      "_id tableNumber name capacity status shopId"
    );

    if (!table) {
      return res.status(404).json({ msg: "Table not found" });
    }

    res.json(table);

  } catch (error) {
    console.error("Get Public Table Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Update Table
================================ */
export const updateTable = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
    });

    if (!table) {
      return res.status(404).json({ msg: "Table not found" });
    }

    // Check if table number is being changed and if new number already exists
    if (req.body.tableNumber && req.body.tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({
        shopId: req.user.shopId,
        tableNumber: req.body.tableNumber,
      });

      if (existingTable) {
        return res.status(400).json({
          msg: "Table number already exists for this shop",
        });
      }
    }

    Object.assign(table, req.body);
    await table.save();

    res.json({
      msg: "Table Updated ✅",
      table,
    });

  } catch (error) {
    console.error("Update Table Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Delete Table
================================ */
export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
    });

    if (!table) {
      return res.status(404).json({ msg: "Table not found" });
    }

    await table.deleteOne();

    res.json({ msg: "Table Deleted ✅" });

  } catch (error) {
    console.error("Delete Table Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* ================================
   Get Table by QR Code
================================ */
export const getTableByQrCode = async (req, res) => {
  try {
    const table = await Table.findOne({
      qrCode: req.params.qrCode,
    });

    if (!table) {
      return res.status(404).json({ msg: "Table not found" });
    }

    res.json(table);

  } catch (error) {
    console.error("Get Table by QR Code Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

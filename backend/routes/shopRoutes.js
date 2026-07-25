import express from "express";

import {
  addProduct,
  updateProduct,
  deleteProduct,
  getShopMenu,
  getAllProducts,
  toggleAvailability,
  getShopProfile,
  updateShopProfile,
  createTable,
  getAllTables,
  getTableDetails,
  updateTable,
  deleteTable,
  getTableByQrCode,
} from "../controllers/shopController.js";

import {
  protect,
  isShopAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* Shop Profile Routes */
router.get("/profile", protect, isShopAdmin, getShopProfile);
router.put("/profile", protect, isShopAdmin, updateShopProfile);

/* Shop Admin Routes */
router.get("/products", protect, isShopAdmin, getAllProducts);

router.post("/", protect, isShopAdmin, addProduct);

router.put("/:id", protect, isShopAdmin, updateProduct);

router.delete("/:id", protect, isShopAdmin, deleteProduct);

router.patch(
  "/:id/toggle",
  protect,
  isShopAdmin,
  toggleAvailability
);

/* Table Management Routes */
router.post("/tables", protect, isShopAdmin, createTable);
router.get("/tables", protect, isShopAdmin, getAllTables);
router.get("/tables/:id", protect, isShopAdmin, getTableDetails);
router.put("/tables/:id", protect, isShopAdmin, updateTable);
router.delete("/tables/:id", protect, isShopAdmin, deleteTable);

/* Public Table Routes */
router.get("/table/qr/:qrCode", getTableByQrCode);

/* Public Menu */
router.get("/menu/:shopId", getShopMenu);

export default router;

const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
  getAdminProducts,
} = require("../contollers/productController.js");
const { isAuthUser, authorizeRoles } = require("../middleware/auth.js");

const router = express.Router();

router.route("/products").get(getAllProducts);
router
  .route("/admin/product/new")
  .post(isAuthUser, authorizeRoles("admin"), createProduct);
router
  .route("/admin/product/:id")
  .put(isAuthUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthUser, authorizeRoles("admin"), deleteProduct); // alag se route banake delete likhna bhi same hai
router.route("/product/:id").get(getProductDetails);
router.route("/review").put(isAuthUser, createProductReview);
router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthUser, authorizeRoles("admin"), deleteReview);
router.route("/admin/products").get(isAuthUser, authorizeRoles("admin"), getAdminProducts);
module.exports = router;

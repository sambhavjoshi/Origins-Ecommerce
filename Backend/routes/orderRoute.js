const express = require('express');
const router = express.Router();
const {isAuthUser,authorizeRoles} = require('../middleware/auth.js');
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../contollers/orderController');


router.route("/order/new").post(isAuthUser,newOrder);
router.route("/order/:id").get(isAuthUser,getSingleOrder);
router.route("/orders/me").get(isAuthUser,myOrders);
router.route("/admin/orders").get(isAuthUser,authorizeRoles("admin"),getAllOrders);
router.route("/admin/order/:id").put(isAuthUser,authorizeRoles("admin"),updateOrder).delete(isAuthUser,authorizeRoles("admin"),deleteOrder);
module.exports = router;
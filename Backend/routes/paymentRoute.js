const express = require("express");
const router = express.Router();
const { isAuthUser} = require("../middleware/auth.js");
const { processPayment, sendStripeApiKey } = require("../contollers/paymentControllers.js");

router.route("/payment/process").post(isAuthUser,processPayment);
router.route("/stripeapikey").get(isAuthUser,sendStripeApiKey);
module.exports = router;

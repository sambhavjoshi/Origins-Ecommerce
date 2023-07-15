const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.processPayment = catchAsyncErrors(async(req,res,next)=>{
    //console.log("step - 2");
    const myPayment = await stripe.paymentIntents.create({
        amount : req.body.amount,
        currency:"inr",
        metadata:{
            company:"Ecommerce"
        }
    });
   // console.log("step - 3");
    res.status(200).json({
        success:true,
        client_secret: myPayment.client_secret
    });
});

exports.sendStripeApiKey = catchAsyncErrors(async(req,res,next)=>{
    console.log("yahan aaya hai");
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY
    })
})
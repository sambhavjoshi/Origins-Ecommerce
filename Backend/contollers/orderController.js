const Order = require('../models/orderModel');
let Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErorrs = require("../middleware/catchAsyncErrors");


// create new order
exports.newOrder = catchAsyncErorrs(async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        discountedPrice
    } = req.body;
    console.log(orderItems);
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        discountedPrice,
        paidAt: Date.now(),
        user: req.user._id
    });
    res.status(201).json({
        success:true,
        order
    });
});


// get single order
exports.getSingleOrder = catchAsyncErorrs(async(req,res,next)=>{

    const order = await Order.findById(req.params.id).populate("user","name email");
    if(!order) return next(new ErrorHandler("order not found",404));
    res.status(200).json({
        success:true,
        order
    });
});

// get logged in user orders
exports.myOrders = catchAsyncErorrs(async(req,res,next)=>{

    const orders = await Order.find({user:req.user._id});

    res.status(200).json({
        success:true,
        orders
    });
});

// get all order -- admin
exports.getAllOrders = catchAsyncErorrs(async(req,res,next)=>{

    const orders = await Order.find();
    let amt = 0;
    orders.forEach((order)=> amt += order.totalPrice);
    
    res.status(200).json({
        success:true,
        amt,
        orders
    });
});

// update order status -- admin
exports.updateOrder = catchAsyncErorrs(async(req,res,next)=>{

    const order = await Order.findById(req.params.id);
    
    if(!order) return next(new ErrorHandler("order not found",404));

    if(order.orderStatus === "Delivered") {
        return next(new ErrorHandler("already delivered",400));
    } 
    
  

   if(req.body.status === "Shipped"){
     order.orderItems.forEach(async (order)=>{
        await updateStock(order.product,order.quantity);
    })
    }
    
    order.orderStatus = req.body.status;
    if(req.body.status === "Delivered") order.deliveredAt = Date.now();
     
    await order.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
    });
});


async function updateStock(id,quantity){
    const product = await Product.findById(id);
    product.stock = Math.max(product.stock - quantity,0);
    await product.save({validateBeforeSave:false});
}

//delete Order -- admin
exports.deleteOrder = catchAsyncErorrs(async(req,res,next)=>{
    
    const order = await Order.findById(req.params.id);
    if(!order) return next(new ErrorHandler("order not found",404));
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success:true,
    });
});
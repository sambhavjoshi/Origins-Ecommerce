const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErorrs = require("../middleware/catchAsyncErrors");
const User = require("../models/userModels");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { errorMonitor } = require("events");
const cloudinary  = require("cloudinary");

// function for registration of user
exports.registerUser = catchAsyncErorrs( async(req,res,next)=>{
    
    var Public_id = "";
    var Url = "";
    
    try{
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder: "avatars",
        width:150,
        crop:"scale"
    });
    Public_id = myCloud.public_id;
    Url = myCloud.secure_url;
    }
    catch(error){
        console.log(error);
    }
 
    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:Public_id,
            url:Url
        },
        role : req.body.role ? req.body.role : "user"
    });
    sendToken(user,201,res);
});

// user login
exports.loginUser = catchAsyncErorrs (async (req,res,next) => {

    const {email,password} = req.body;
    //checing if both given
    if(!email || !password) return next(new ErrorHandler("Please enter email and password",400));

    const user = await User.findOne({email}).select("+password");
    if(!user) return next(new ErrorHandler("Invalid email or password",401));

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }
   
    sendToken(user,200,res);
})

// user logout 
exports.logout = catchAsyncErorrs(async(req,res,next)=>{
   
    res.cookie("token",null,{
    expires: new Date(Date.now()),
    httpOnly:true
    }) 
    res.status(200).json({
        success:true,
        message: "Logged out successfully",
    });
});

// forgot password
exports.forgotPassword = catchAsyncErorrs(async(req,res,next)=>{


    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    // get resetPassword token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`;

    try{
         await sendEmail({
             email:user.email,
             subject:`Ecommerce Password Recovery`,
             message,
         });
         res.status(200).json({
            success:true,
            message:`email sent to ${user.email} successfully`
         })
    }
    catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(error.message,500));
    }
})

//reset pssword
exports.resetPassword = catchAsyncErorrs(async (req,res,next) =>{
    // creating token hash     
    const resetPasswordToken = req.params.token;
    const user = await User.findOne({resetPasswordToken,resetPasswordExpire:{$gt:Date.now()}});
    if(!user){
        return next(new ErrorHandler("reset password token is invalid or expired",400));
    }
    if(req.body.password != req.body.confirmPassword){
        return next(new ErrorHandler("passwords does not match",400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user,200,res);//to login
})

// get user details

exports.getUserDetails = catchAsyncErorrs(async(req,res,next)=>{

    const user = await User.find({_id:req.user.id});
    res.status(200).json({
        success:true,
        user
    });
})
//update user password

exports.updatePassword = catchAsyncErorrs(async(req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old Password is Incorrect",400));
    }
    
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user,200,res);
    res.status(200).json({
        success:true,
        user
    });
})


//update profile

exports.updateUserProfile = catchAsyncErorrs(async(req,res,next)=>{
    
    const newData = {
        name: req.body.name,
        email: req.body.email
    };  
    if(req.body.avatar !== "abc"){
      //  console.log("still got here")
        const user = await User.findById(req.user.id); 
        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder: "avatars",
            width:150,
            crop:"scale"
        });
        
        newData.avatar = {
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    }

    const temp = await User.findByIdAndUpdate(req.user.id,newData,{
        new : true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true
    });
})

//get all users (admin)
exports.getAllUsers = catchAsyncErorrs(async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        success:true,
        users
    });
})

// get single user details (admin)
exports.getSingleUser = catchAsyncErorrs(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user) return next(new ErrorHandler("user does not exist with this id",400));
    res.status(200).json({
        success:true,
        user
    });
})

// admin updates user profile 
exports.updateProfileAdmin = catchAsyncErorrs(async(req,res,next)=>{
    
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };
        
    const user = await User.findByIdAndUpdate(req.params.id,newData,{
        new : true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true,
        user
    });
})
// delete user admin
exports.deleteUser = catchAsyncErorrs(async(req,res,next)=>{
    
    const user = await User.findById(req.params.id);
    if(!user) return next(new ErrorHandler("user  does not exist",400));

      const imageId = user.avatar.public_id;
      await cloudinary.v2.uploader.destroy(imageId);

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success:true,
        message:"user deleted successfully"
    });
})
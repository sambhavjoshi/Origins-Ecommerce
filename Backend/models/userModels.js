const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const crypto = require("crypto")


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Naam toh daliye"],
        maxLength:[30,"Bahut bada naam hai"],
        minLength:[4,"valid naam likho yrr"]
    },
    email:{
        type:String,
        required:[true,"email daliye"],
        unique:true,
        validate:[validator.isEmail,"kaam krne wala email daliye"]
    },
    password:{
        type:String,
        required:[true,"password achha hona chahiye"],
        minLength:[8,"itna chhota password nhi chlega"],
        select:false,
    },
    role:{
        type:String,
        default:"user"
    },
    avatar:{
        public_id:{
            type:String,
            required: true
        },
        url:{
            type:String,
            required: true
        },
    },
    resetPasswordToken:String,
    resetPasswordExpire: Date,
});


// JWT TOKEN// allows login
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// compare password

userSchema.methods.comparePassword = async function(enteredPassword){
    return enteredPassword === this.password;
}

// generating reset password token
userSchema.methods.getResetPasswordToken = function(){
     // generating token
     const resetToken ="aaa";

     //hashing and adding resetPasswordToken to userSchema
     return resetToken;
}

module.exports = mongoose.model("User",userSchema);
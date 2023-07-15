const mongoose = require("mongoose");

let productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter product name"],
        trim:true
    },
    description: String,
    price:{
        type:Number,
        required:[true,"Please enter product price"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
        public_id:{
            type:String,
            required: true
        },
        url:{
            type:String,
            required: true
        }
    }
    ],
    category:{
        type:String,
        required:[true,"please enter category"]
    },
    stock:{
        type:Number,
        required:[true,"please enter product stock"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name:{
                type:String,
                reqyired:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    discount:{
        type:Number,
        default:0
    }
})

productSchema.pre("save",async function(next){
    if(!this.isModified("name")){
        let a = 1;
    }
    next();
})

module.exports = mongoose.model("Product",productSchema)

 
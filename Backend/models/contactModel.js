const mongoose = require("mongoose");

let contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter product name"],
    trim: true,
  },
  message:{
    type:String,
    required: [true, "please dont drop an empty message"],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  address: {
    type:String,
    required: [true,"please leave your contact"]
  }
});

contactSchema.pre("save", async function (next) {
  if (!this.isModified("name")) {
    let a = 1;
  }
  next();
});

module.exports = mongoose.model("Contact", contactSchema);

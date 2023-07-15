let Contact = require("../models/contactModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErorrs = require("../middleware/catchAsyncErrors");

exports.createContact = catchAsyncErorrs(async (req, res, next) => {

  const contact = await Contact.create(req.body);
  res.status(201).json({
    success: true,
    contact,
  });
});

exports.getAllContacts = catchAsyncErorrs(async (req,res,next) =>{
        
      const contacts = await Contact.find();
      res.status(200).json({
        success:true,
        contacts
      })
});

exports.deleteContact = catchAsyncErorrs(async (req,res,next)=>{
      const contact = await Contact.findById(req.params.id);
      if (contact === null) {
        return next(new ErrorHandler("message not found", 404));
      }

      await Contact.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "message deleted successfully",
      });
});



exports.getContact = catchAsyncErorrs(async (req,res,next) =>{
     const contact = await Contact.findById(req.params.id);
     if(contact === null) return next(new ErrorHandler("contact not found",404));

     res.status(200).json({
      success:true,
      contact
     });
});
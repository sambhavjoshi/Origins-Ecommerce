let Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErorrs = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

//create product -- only by admin
exports.createProduct = catchAsyncErorrs(async (req, res, next) => {
  let images = [];
  //console.log(typeof req.body.images);
  //console.log("ye chla hai - 4");
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if(req.body.discount && (req.body.discount < 0 || req.body.discount >= 100)) {
    return next(new ErrorHandler("Please enter a valid discount",404));
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
   // console.log("ye chla hai 4.5");
    //console.log(images[i].length);
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
       transformation: [
        { width: 1000, height: 1000, crop: 'limit' }
       ] 
    });
   // console.log("ye chla hai 5");
    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

// get all products
exports.getAllProducts = catchAsyncErorrs(async (req, res, next) => {
  const resultPerPage = 8;
  const temp = new ApiFeatures(Product.find(), req.query).search().filter();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await apiFeature.query;
  const tmp = await temp.query;
  const productsCount = tmp.length;
  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
  });
});

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErorrs(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

//update product --- only admin

exports.updateProduct = catchAsyncErorrs(async (req, res, next) => {
  let product = Product.findById(req.params.id);

  if (!product)
    return res.status(500).json({
      success: false,
      message: "product not found",
    });

  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

//delete product -- admin

exports.deleteProduct = catchAsyncErorrs(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (product === null) {
    return next(new ErrorHandler("product not found", 404));
  }

  //deleting images from cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }
  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "product deleted successfully",
  });
});

//get details
exports.getProductDetails = catchAsyncErorrs(async (req, res, next) => {
  var product = null;
  product = await Product.findById(req.params.id);
  if (product === null) return next(new ErrorHandler("product not found", 404));

  res.status(200).json({
    success: true,
    product,
  });
});

// create new review or update review
exports.createProductReview = catchAsyncErorrs(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});

//get all reviews of a product
exports.getProductReviews = catchAsyncErorrs(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  console.log(product);
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// delete review
exports.deleteReview = catchAsyncErorrs(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  let ratings = 0;
  if (reviews.length > 0) ratings = avg / reviews.length;
  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, numOfReviews },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    reviews: reviews,
  });
});

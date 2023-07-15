const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error");
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const path = require("path");




if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}


app.use(
  express.json({
    limit: "100mb",
  })
);
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
app.use(express.json()) // so that whatever we get from is in json format
// importing Routes
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended : true}));
app.use(fileUpload());
//app.use(express.raw({ type: "*/*", limit: "50mb" }));


const productR = require("./routes/productRoute.js");
const user = require("./routes/userRoute") ;
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");
const contact = require("./routes/contactRoute");

app.use("/api/v1",productR);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1",payment);
app.use("/api/v1",contact);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});

// middleware for errors
app.use(errorMiddleware);
module.exports = app;


const express = require("express");
const productController = require("../Controllers/productController");
const { userAuth, vendorOnly } = require("../middleware/userAuth");
const { ProductStore } = require("../Config/multer");

const router = express.Router();

const productImgLimit = process.env.PRODUCT_IMG_LIMIT;

router.post("/add",
    userAuth,
    vendorOnly,
    ProductStore.array("productImg", productImgLimit),
    productController.add);


module.exports = router;
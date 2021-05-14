const express = require("express");
const productController = require("../Controllers/productController");
const userAuth = require("../middleware/userAuth");
const store = require("../Config/multer");

const router = express.Router();

const urlencoder = express.urlencoded({ extended: true });

router.get('/',
    userAuth.vendorAuth,
    productController.show);

router.post("/add",
    urlencoder,
    userAuth.vendorAuth,
    store.ProductStore.single("productImg"),
    productController.add);

module.exports = router;
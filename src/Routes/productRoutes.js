const express = require("express");
const productController = require("../Controllers/productController");
const { userAuth, vendorOnly } = require("../middleware/userAuth");
const store = require("../Config/multer");

const router = express.Router();

const urlencoder = express.urlencoded({ extended: true });

router.post("/add",
    userAuth,
    vendorOnly,
    store.ProductStore.single("productImg"),
    productController.add);

module.exports = router;
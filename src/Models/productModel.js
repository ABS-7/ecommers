const mongoose = require("mongoose");
const timestamp = require('mongoose-timestamp');

const products = new mongoose.Schema({

    productsName: {
        type: String,
        required: true,
    },
    productPrice: {
        type: Number,
        required: true
    },
    productStock: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    img: {
        productImgPath: {
            type: String,
        }
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    }
}, { collection: "Products" });


products.plugin(timestamp, {
    disableCreated: false, // Disables the logging of the creation date
});

const productsModel = new mongoose.model("Products", products);

module.exports = productsModel;
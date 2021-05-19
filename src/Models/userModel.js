const { object } = require("joi");
const mongoose = require("mongoose");
const timestamp = require('mongoose-timestamp');

const users = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    userName: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    userType: {
        type: String,
        required: true,
    },
    tokens: [{
        type: String
    }],
    otp: {
        type: Number,
    },
    verified: {
        type: Boolean,
        default: false,
        required: true
    },
    socialLogin: {
        isSocialLogin: Boolean,
        dataAndID: [{
            platform: String,
            ID: String
        }]
    },

}, { collection: "Users" });


users.plugin(timestamp, {
    disableCreated: false, // Disables the logging of the creation date
});

const userModel = new mongoose.model("Users", users);

module.exports = userModel;
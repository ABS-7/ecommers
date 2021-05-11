const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: '../.env' });

//const dbURL = process.env.dbURL || 'mongodb+srv://ecommerce:7iYh4EzVgyKD8Zsu@cluster0.htqd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const dbURL = 'mongodb://ecommerce:7iYh4EzVgyKD8Zsu@cluster0-shard-00-00.htqd1.mongodb.net:27017,cluster0-shard-00-01.htqd1.mongodb.net:27017,cluster0-shard-00-02.htqd1.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-euytt2-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => { console.log("db connect sucessfully..."); }).catch((err) => console.log(err));
const mongoose = require("mongoose");

const dbURL = process.env.dbURL || 'mongodb+srv://ecommerce:7iYh4EzVgyKD8Zsu@cluster0.htqd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';


// const connection = mongoose.createConnection(dbURL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true
// }).then(() => { console.log("db connect sucessfully..."); }).catch((err) => console.log(err));;

mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => { console.log("db connect sucessfully..."); }).catch((err) => console.log(err));
const express = require('express');
const cors = require('cors');
const userRouter = require('./Routes/userRoutes');
const productRouter = require('./Routes/productRoutes');
const authRouter = require('./Routes/socialMediaAuthRoutes');
const path = require('path');

require('./Config/dbConnection');

const app = express();

const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

app.use("/user", userRouter);

app.use("/product", productRouter);

const server = app.listen(port, (error) => {
    if (error) console.log(error);
    else console.log("server is listening on " + server.address().address + '/' + server.address().port + '...');
});
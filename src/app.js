const express = require('express');
const cors = require('cors');
const userRouter = require('./Routes/userRoutes');

require('dotenv').config({ path: '../.env' });
require('./Config/dbConnection');

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/user", userRouter);


const server = app.listen(port, (error) => {
    if (error)
        console.log(error);
    else
        console.log("server is listening on " + server.address().address + '/' + server.address().port + '...');
});
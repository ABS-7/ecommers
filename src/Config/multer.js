const multer = require('multer');

const storageProduct = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/productImgs/');
    },
    filename: function (req, file, cb) {
        const ex = file.originalname.substr(file.originalname.lastIndexOf('.'));
        const date = Date.now();
        req.body.datestemp = date;
        cb(null, req.body.productName + '-' + date + ex);
    }
});

const ProductStore = multer({ storage: storageProduct });

module.exports = {
    ProductStore
};
const productModel = require('../Models/productModel');

async function add(req, res) {
    const data = req.body;
    const files = req.files;
    let imgsPath = [];
    for (let img = 0; img < files.length; img++) {
        imgsPath.push(files[img].path);
    }
    try {
        const addProductResult = await productModel.create({
            productName: data.productName,
            productPrice: data.productPrice,
            productStock: data.productStock,
            addedBy: req.user._id,
            imgs: { productImgsPath: imgsPath }
        });
        if (addProductResult._id != undefined) {
            return res.status(200).json({ message: 'success' });
        } else { return res.status(500).json({ message: 'dataase error' }); }
    } catch (error) { return res.status(500).json({ message: error }); }
}

module.exports = {
    add,
}
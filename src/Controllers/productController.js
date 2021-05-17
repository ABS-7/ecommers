const productModel = require('../Models/productModel');

async function show(req, res) {
    console.log(req.user);
    try {
        const userProducts = productModel.find({ addedBy: req.user._id });
        console.log(userProducts);
    } catch (error) { return res.status(500).json({ message: error }); }

    return res.send("in product controller");
}

async function add(req, res) {
    const data = req.body;
    try {
        const addProductResult = await productModel.create({
            productName: data.productName,
            productPrice: data.productPrice,
            productStock: data.productStock,
            addedBy: req.user._id,
            img: { productImgPath: req.file.path }
        });
        if (addProductResult._id != undefined) {
            return res.status(200).json({ message: 'success' });
        } else { return res.status(500).json({ message: 'dataase error' }); }
    } catch (error) { return res.status(500).json({ message: error }); }
}

module.exports = {
    show,
    add
}
const productModel = require('../Models/productModel');

async function show(req, res) {
    try {
        const userProducts = await productModel.find({ addedBy: req.user._id });
        return res.status(200).json({
            user: {
                name: req.user.name,
                userType: req.user.userType,
                userName: req.user.userName,
                verified: req.user.verified,
                email: req.user.email
            },
            products: userProducts
        });
    } catch (error) { return res.status(500).json({ message: error }); }
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
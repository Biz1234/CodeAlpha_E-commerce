
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');


router.get('/', async (req, res) => {

    try {
        res.json({ items: []});
    } catch (err) {
        res.status(500).json({ message: 'server error',error: err.message});

    }
});


router.post('/', async (req,res) => {
const { productId,quantity } = req.body;
try {
    
const product = await Product.findById(productId);
if (!product) {
    return res.status(400).json({ message: 'product not found'});
}
if (product.stock < quantity ) {
return res.status(400).json({message:'insufficient stock'});

}

res.json({ productId,quantity,product});
} catch (err) {
    res.status(500).json({ message: 'server error', error: err.message});
}


});

module.exports = router;
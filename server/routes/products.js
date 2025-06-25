const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const product = require('../models/Product');

// get all products

router.get('/', async (req, res) => {
try {
    const products = await Product.find();
    res.json(products);

}
catch(err) {
    res.status(500).json({message:'server error', error: err.message});

}
});

// get single product by id
router.get('/:id', async (req,res) => {

try{
const foundProduct =await product.findById(req.params.id);
if (!product) {
    return res.status(404).json({message:'product not found'});
}
res.json(foundProduct);

} catch (err){
res.status(500).json({message: 'server error', error: err.message});
}

});


module.exports= router;
const Productlist = require("../../models/sales/productList");

module.exports.getProduct = async (req, res) => {
  try {
    const { startupId } = req.query; // e.g., /api/product/:startupId

    const products = await Productlist.find({ startupId });

    if (!products || products.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No products found for this startup",
      });
    }

    res.json({
      status: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports.createProduct = async (req, res) => {
  try {
    const { startupId, name, category, price } = req.body;
    if (!startupId || !name || !category || !price) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required!" });
    }
    const newProduct = new Productlist({ startupId, name, category, price });
    const savedProduct = await newProduct.save();
    res.status(201).json({
      status: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      err: error.message,
    });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; // get id from URL
    const product = await Productlist.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }
    await product.deleteOne();
    res.json({ status: true, message: "Product removed", id });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

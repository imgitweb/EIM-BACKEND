const Market = require("../models/marketSize");

module.exports = async (req, res) => {
  try {
    const {
      userid,
      productService,
      industryType,
      targetGeography,
      customerSegment,
      averagePrice,
      revenueModel,
    } = req.body;
    const updateMarket = await Market.findOneAndUpdate(
      { userId: userid },
      {
        userId: userid,
        productService,
        industryType,
        targetGeography,
        customerSegment,
        averagePrice,
        revenueModel,
      },
      { new: true, runValidators: true }
    );
    if (!updateMarket) {
      const newMarket = await Market.create({
        userId: userid,
        productService,
        industryType,
        targetGeography,
        customerSegment,
        averagePrice,
        revenueModel,
      });
      return res.status(201).json({
        status: true,
        message: "Market Size created successfully",
        data: newMarket,
      });
    }
    return res.status(200).json({
      status: true,
      message: "Market Size updated successfully",
      data: updateMarket,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

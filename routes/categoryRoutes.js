const express = require("express");
const { addCategory, getAllCategory } = require("../controller/addCategoryController");
const routes = express.Router();

module.exports = (upload) => {
    routes.post("/add-category", upload.single('logo'), addCategory);
    routes.get("/get-category", getAllCategory);
    // routes.post("/delete-category", deleteCategory);
    return routes;
}
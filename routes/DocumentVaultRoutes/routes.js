const {
  Add_document,
  Get_compliances,
  Soft_delete,
} = require("../../controller/DocumentVaultController/DocumentVaultController");

const route = require("express").Router();

const DocumentVault = (upload) => {
  route.post("/add", upload.single("file"), Add_document);
  route.post("/get", Get_compliances);
  route.post("/delete", Soft_delete);

  return route;
};

module.exports.DocumentVaultRoutes = DocumentVault;

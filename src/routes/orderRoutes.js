const express = require("express");
const OrderController = require("../controllers/OrderController");

const router = express.Router();

router.post("/", OrderController.create);
router.get("/", OrderController.findAll);
router.get("/:id", OrderController.findOne);
router.put("/:id", OrderController.update);
router.patch("/:id/status", OrderController.updateStatus);
router.delete("/:id", OrderController.delete);

module.exports = router;

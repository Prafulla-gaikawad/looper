const express = require("express");
const router = express.Router();
const { getAllTransactions } = require("../controllers/transactionController");

router.get("/", getAllTransactions);

module.exports = router;

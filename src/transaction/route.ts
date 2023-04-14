import express = require("express");
import { createTransaction, getAllTransactions, getOneTransaction } from "./controller";

const transactionRoutes = express.Router();

transactionRoutes.post("/do-transaction", createTransaction);
transactionRoutes.get("/all", getAllTransactions);
transactionRoutes.get("/:id", getOneTransaction);

export default transactionRoutes;

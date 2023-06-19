import express = require("express");
import { createTransaction, creditAccount, getAllTransactions, getOneTransaction } from "./controller";

const transactionRoutes = express.Router();

transactionRoutes.post("/credit", creditAccount);
transactionRoutes.post("/debit", createTransaction);
transactionRoutes.post("/transfert", createTransaction);
transactionRoutes.get("/all", getAllTransactions);
transactionRoutes.get("/:id", getOneTransaction);

export default transactionRoutes;

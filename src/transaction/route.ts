import express = require("express");
import {
	createTransaction,
	creditAccount,
	getAllTransactions,
	getOneTransaction,
	getUserTransactions,
	changeStatus,
} from "./controller";

const transactionRoutes = express.Router();

transactionRoutes.post("/credit", creditAccount);
transactionRoutes.post("/debit", createTransaction);
transactionRoutes.post("/transfert", createTransaction);
transactionRoutes.post("/change-status", changeStatus);
transactionRoutes.get("/user-transactions", getUserTransactions);
transactionRoutes.get("/all", getAllTransactions);
transactionRoutes.get("/:id", getOneTransaction);

export default transactionRoutes;

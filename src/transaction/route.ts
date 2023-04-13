import express = require("express");
import { createTransaction } from "./controller";

const transactionRoutes = express.Router();

transactionRoutes.post("/do-transaction", createTransaction)

export default transactionRoutes;

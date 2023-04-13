import express = require("express");
import { createWithdrawalTransaction } from "./controller";

const transactionRoutes = express.Router();

transactionRoutes.post("/withdrawal", createWithdrawalTransaction)

export default transactionRoutes;

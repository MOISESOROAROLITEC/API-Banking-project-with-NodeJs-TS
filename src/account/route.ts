import express = require("express");
import { createAccount, getAccounts, getOneAccount } from "./controller";

const accountRoutes = express.Router();

accountRoutes.post("/account/create", createAccount);
accountRoutes.get("/account/:id", getOneAccount)
accountRoutes.get("/accounts", getAccounts)

export default accountRoutes;

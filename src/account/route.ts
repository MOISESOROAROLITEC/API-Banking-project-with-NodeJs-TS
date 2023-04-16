import express = require("express");
import { changeAccountType, createAccount, getAccounts, getOneAccount, removeAccounts } from "./controller";

const accountRoutes = express.Router();

accountRoutes.post("/account/create", createAccount);
accountRoutes.get("/accounts", getAccounts);
accountRoutes.get("/account/change-type", changeAccountType);
accountRoutes.get("/account/remove-all", removeAccounts);
accountRoutes.get("/account/:id", getOneAccount);

export default accountRoutes;

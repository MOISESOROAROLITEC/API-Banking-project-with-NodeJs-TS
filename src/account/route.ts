import express = require("express");
import {
	changeAccountType,
	createAccount,
	getAccounts,
	getOneAccount,
	removeAccounts,
	getUserAccounts,
} from "./controller";
const accountRoutes = express.Router();

accountRoutes.post("/account/create", createAccount);
accountRoutes.get("/account/accounts", getAccounts);
accountRoutes.get('/acounts-of-user', getUserAccounts);
accountRoutes.patch("/account/change-type", changeAccountType);
accountRoutes.delete("/account/remove-all", removeAccounts);
accountRoutes.get("/account/:id", getOneAccount);

export default accountRoutes;

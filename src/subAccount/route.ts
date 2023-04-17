import express = require("express");
import { createSubAccount, getOneSubAccount, getSubAccounts, removeSubAccounts } from "./controller";

const subAccountRoutes = express.Router();

subAccountRoutes.post("/create", createSubAccount);
subAccountRoutes.delete("/remove-all", removeSubAccounts)
subAccountRoutes.get("/accounts", getSubAccounts);
subAccountRoutes.get("/:id", getOneSubAccount);


export default subAccountRoutes;

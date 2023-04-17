import express = require("express");
import { createSubAccount, getOneSubAccount, removeSubAccounts } from "./controller";

const subAccountRoutes = express.Router();

subAccountRoutes.post("/create", createSubAccount);
subAccountRoutes.delete("/remove-all", removeSubAccounts)
subAccountRoutes.get("/:id", getOneSubAccount);
// subAccountRoutes.get("/accounts", getAccounts);

export default subAccountRoutes;

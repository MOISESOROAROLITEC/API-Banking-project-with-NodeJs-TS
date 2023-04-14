import express = require("express");
import { createSubAccount, getOneSubAccount } from "./controller";

const subAccountRoutes = express.Router();

subAccountRoutes.post("/create", createSubAccount);
subAccountRoutes.get("/:id", getOneSubAccount);
// subAccountRoutes.get("/accounts", getAccounts);

export default subAccountRoutes;

import express = require("express");
import { createAccount, getOneAccount } from "./controller";

const accountRoutes = express.Router();

accountRoutes.post("/account/create", createAccount);
accountRoutes.get("/account/:id", getOneAccount)

export default accountRoutes;

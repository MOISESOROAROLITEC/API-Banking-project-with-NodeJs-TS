import express = require("express");
import { createAccount } from "./controller";

const accountRoutes = express.Router();

accountRoutes.post("/account/create", createAccount);

export default accountRoutes;

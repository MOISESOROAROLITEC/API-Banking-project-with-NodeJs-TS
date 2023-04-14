import express = require("express");
import { createSubAccount } from "./controller";

const subAccountRoutes = express.Router();

subAccountRoutes.post("/create", createSubAccount);

export default subAccountRoutes;

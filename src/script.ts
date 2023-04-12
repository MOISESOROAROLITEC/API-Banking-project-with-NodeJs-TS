// import express, { Request, Response } from 'express';
import express = require("express");
import dotenv = require('dotenv');
import userRoutes from './user/route';
import bodyParser = require("body-parser");


dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/", userRoutes);

app.listen(PORT, () => {
	console.log(`Server starting at : localhost: ${PORT}`);
});

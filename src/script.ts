// import express, { Request, Response } from 'express';
import express = require("express");
import { PrismaClient } from '@prisma/client';
import dotenv = require('dotenv');
import userRoutes from './route/user';
import bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

const prisma = new PrismaClient();


var options = {
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/", userRoutes)

app.listen(PORT, () => {
	console.log(`Serveur démarré sur le port ${PORT}`);
});

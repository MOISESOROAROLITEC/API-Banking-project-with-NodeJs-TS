import express = require("express");
import dotenv = require('dotenv');
import userRoutes from './user/route';
import bodyParser = require("body-parser");
import accountRoutes from "./account/route";
import transactionRoutes from "./transaction/route";
import subAccountRoutes from "./subAccount/route";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:4200");
	res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
	next();
});

app.use("/", userRoutes);
app.use("/", accountRoutes);
app.use("/transaction", transactionRoutes);
app.use('/sub-account', subAccountRoutes)


app.listen(PORT, () => {
	console.log(`Server starting at : localhost: ${PORT}`);

});

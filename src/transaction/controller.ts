import { Request, Response } from "express";
import { Account, Prisma, PrismaClient } from "@prisma/client";
import { withdrawalValidator } from "./validator";
import * as iban from "iban-ts";
import * as bcryptjs from 'bcryptjs'
const prisma = new PrismaClient();



export const createWithdrawalTransaction = async (req: Request, res: Response) => {
	try {
		const isValidate = withdrawalValidator.validate(req.body).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		const { accountEmmiterIban, accountPassword, amount } = req.body;

		const account = await prisma.account.findUnique({ where: { iban: accountEmmiterIban } })
		if (!account) {
			return res.status(400).json({ message: `not account with IBAN : ${accountEmmiterIban}` })
		}
		const matchPassword = await bcryptjs.compare(accountPassword, account.password);
		if (!matchPassword) {
			return res.status(400).json({ message: "password is not correct" })
		}

		if (account.balance >= +amount) {
			account.balance = account.balance - +amount
			var newAccount = await prisma.account.update({
				where: { iban: account.iban }, data: { balance: account.balance }
			});
		} else {
			return res.status(400).json({
				message: `the amount entered is greater than the amount in the account. The amount available is ${account.balance}`
			});
		}
		const transaction = await prisma.transaction.create({
			data: {
				transactionType: "withdrawal",
				accountReciver: "null",
				amount: amount,
				AccountEmmiter: {
					connect: { iban: accountEmmiterIban }
				}
			}
		})
		return res.status(201).json({ transaction })
	} catch (error) {
		console.log({ error });
		return res.status(500).json({ message: "server was crashed", error })
	}
}

// export const getOneAccount = async (req: Request, res: Response) => {
// 	try {
// 	} catch (error) {
// 		return res.status(500).json({ message: "server was crashed", error })
// 	}
// }

// export const getAccounts = async (req: Request, res: Response) => {
// 	try {
// 	} catch (error) {
// 		return res.status(500).json({ message: "server was crashed", error })
// 	}
// }

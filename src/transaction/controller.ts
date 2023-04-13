import { Request, Response } from "express";
import { Account, Prisma, PrismaClient } from "@prisma/client";
import { depositValidator, transferValidator, withdrawalValidator } from "./validator";
import * as iban from "iban-ts";
import * as bcryptjs from 'bcryptjs'
import { availableTransactionTypes } from "../common/constantes";
import Joi = require("joi");
import { ibanValidator } from "../common/validator";
const prisma = new PrismaClient();

function transactionTypeIsValide(type: string): boolean {
	return availableTransactionTypes.includes(type);
}
function getTransactionValidationType(transactionType: string): Joi.ObjectSchema<any> {
	switch (transactionType) {
		case "debit":
			return withdrawalValidator
		case "credit":
			return depositValidator
		default:
			return transferValidator
	}
}

export const createTransaction = async (req: Request, res: Response) => {
	try {
		if (!transactionTypeIsValide(req.body.transactionType)) {
			return res.status(400).json({
				message: `transaction type is not correct. correct type are : ${[...availableTransactionTypes]}`
			})
		}
		const { accountEmmiterIban, accountPassword, amount, transactionType } = req.body;
		const accountReciverIban: string = transactionType != "transfer" ? "null" : req.body.accountReciver;
		var validator = getTransactionValidationType(transactionType)
		const isValidate = validator.validate(req.body).error?.details[0].message
		if (isValidate) { return res.status(400).json({ message: isValidate }) }
		const emmiterAccount = await prisma.account.findUnique({ where: { iban: accountEmmiterIban } })
		if (!emmiterAccount) {
			return res.status(400).json({ message: `not account with IBAN : ${accountEmmiterIban}` })
		}
		let newAmount: number
		let reciverAcount

		if (!(transactionType === "credit")) {
			const matchPassword = await bcryptjs.compare(accountPassword, emmiterAccount.password);
			if (!matchPassword) {
				return res.status(400).json({ message: "password is not correct" })
			}
			if (emmiterAccount.balance >= +amount) {
				newAmount = emmiterAccount.balance - +amount
			} else {
				return res.status(400).json({
					message: `the amount entered is greater than the amount in the account. The amount available is ${emmiterAccount.balance}`
				});
			}
			if (!(transactionType === "debit")) {
				reciverAcount = await prisma.account.findUnique({ where: { iban: accountReciverIban } });
				if (!reciverAcount) {
					return res.status(400).json({
						message: `not reciver account with IBAN : ${accountReciverIban}`
					})
				} else {
					const updateAmount: number = reciverAcount.balance + +amount
					await prisma.account.update({
						where: { iban: accountReciverIban }, data: { balance: updateAmount }
					});
				}
			}
		} else {
			newAmount = emmiterAccount.balance + +amount;
		}
		var newAccount = await prisma.account.update({
			where: { iban: emmiterAccount.iban }, data: { balance: newAmount }
		});
		const transaction = await prisma.transaction.create({
			data: {
				transactionType,
				accountReciver: accountReciverIban,
				amount,
				AccountEmmiter: {
					connect: { iban: accountEmmiterIban }
				}
			}
		})
		const { id, createAt, updateAt } = transaction
		return res.status(201).json({
			id, transactionType,
			accountEmmiterIban, emmiterName: emmiterAccount.name,
			emmiterEmail: emmiterAccount.email, currency: emmiterAccount.currency,
			accountReciverIban, reciverName: reciverAcount?.name, reciverEmail: reciverAcount?.email,
			createAt, updateAt
		})
	} catch (error) {
		console.log({ error });
		return res.status(500).json({ message: "server was crashed", error })
	}
}

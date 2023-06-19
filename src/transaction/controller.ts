import { Request, Response } from "express";
import { Account, PrismaClient, SubAccount, Transaction } from "@prisma/client";
import { depositValidator, transferValidator, withdrawalValidator } from "./validator";
import { availableTransactionTypes } from "../common/constantes";
import Joi = require("joi");
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
const prisma = new PrismaClient();

function isTypeValide(type: string): boolean {
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

export const creditAccount = async (req: Request, res: Response) => {
	try {
		const { iban, amount } = req.body
		let accoutToCredit: Account | SubAccount | null = await prisma.account.findUnique({ where: { iban: iban } })
		if (!accoutToCredit?.iban) {
			accoutToCredit = await prisma.subAccount.findUnique({ where: { iban: iban } })
			if (!accoutToCredit) {
				return res.status(404).json({ massage: `Ce iban : '${iban}' ne correspond à aucun compte ou sous compte ` })
			} else {
				accoutToCredit = await prisma.subAccount.update({ where: { iban: iban }, data: { balance: accoutToCredit.balance + +amount } })
			}
		} else {
			accoutToCredit = await prisma.account.update({ where: { iban: iban }, data: { balance: accoutToCredit.balance + +amount } })
		}
		return res.status(200).json(accoutToCredit)
	} catch (error) {
		return res.status(500).json({ massage: "Server was crached" })
	}
}
export const createTransaction = async (req: Request, res: Response) => {
	try {
		if (!isTypeValide(req.body.transactionType)) {
			return res.status(400).json({
				message: `Le type de la transaction est incorrect. les types acceptés sont : ${[...availableTransactionTypes]}`
			})
		}

		const { accountEmmiterIban, amount, transactionType } = req.body;
		const accountReciverIban: string = transactionType != "transfer" ? "null" : req.body.accountReciver;
		var transactionTypeValidator = getTransactionValidationType(transactionType)
		const isValidate = transactionTypeValidator.validate(req.body).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate });
		}
		let emmiterAccount: Account | SubAccount | null = await prisma.account.findUnique({ where: { iban: accountEmmiterIban } })
		if (!emmiterAccount) {
			emmiterAccount = await prisma.subAccount.findUnique({ where: { iban: accountEmmiterIban } })
		}
		if (!emmiterAccount) {
			return res.status(404).json({ message: `Aucun compte n'a ce IBAN : ${accountEmmiterIban}` })
		}
		if (emmiterAccount.type === "blocked" && transactionType !== "credit") {
			return res.status(400).json(
				{
					message: `Il est impossible de faire un retrait ou un trensfert à partie d'un compte blocké.`
				}
			)
		}
		let newAmount: number
		let reciverAcount
		let isAccount: boolean = true

		if (!(transactionType === "credit")) {
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
		try {
			await prisma.account.update({
				where: { iban: emmiterAccount.iban }, data: { balance: newAmount }
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					await prisma.subAccount.update({ where: { iban: emmiterAccount.iban }, data: { balance: newAmount } });
					isAccount = false
				}
			}
		}
		let transaction: Transaction
		if (isAccount) {
			transaction = await prisma.transaction.create({
				data: {
					transactionType,
					accountReciver: accountReciverIban,
					amount,
					AccountEmmiter: {
						connect: { iban: accountEmmiterIban }
					}
				}
			})
		} else {
			transaction = await prisma.transaction.create({
				data: {
					transactionType,
					accountReciver: accountReciverIban,
					amount,
					SubAccountEmmiter: {
						connect: { iban: accountEmmiterIban }
					}
				}
			})
		}
		const { id, createAt, updateAt } = transaction
		return res.status(201).json({
			id, transactionType, accountEmmiterIban, amount, currency: emmiterAccount.currency, accountReciverIban,
			createAt, updateAt
		})
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getOneTransaction = async (req: Request, res: Response) => {
	try {
		const id: number = +req.params.id
		if (!id) {
			return res.status(400).json({ message: `you should provide id and it should be a number` })
		}
		const transaction = await prisma.transaction.findUnique({ where: { id } });
		if (!transaction) {
			return res.status(404).json({ message: `nothing transaction with id : ${id}` })
		}
		return res.status(200).json(transaction);
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getAllTransactions = async (req: Request, res: Response) => {
	const take = Number(req.query.limit) || undefined;
	const skip = Number(req.query.page) || undefined;
	try {
		const transaction = await prisma.transaction.findMany({ take, skip });
		if (!transaction) {
			return res.status(200).json({ message: `nothing found`, transaction })
		}
		const totalRecords: number = await prisma.transaction.count();
		const totalPages: number = take ? Math.ceil(totalRecords / take) : 1;
		const currentPage = skip ? skip : 1;

		return res.status(200).json({ totalRecords, totalPages, currentPage, transaction });
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

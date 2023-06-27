import { Request, Response } from "express";
import { Account, PrismaClient, SubAccount, Transaction } from "@prisma/client";
import { depositValidator, transferValidator, withdrawalValidator } from "./validator";
import { availableTransactionTypes, tokenDecryptedInterface } from "../common/constantes";
import Joi = require("joi");
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getUserByToken } from "../shared/functions";
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
		const { status, message, user } = await getUserByToken(req, res)
		if (status !== 200 || !user) {
			return res.status(status).json({ message })
		}
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
		await prisma.transaction.create({
			data: {
				amount: amount,
				transactionType: "credit",
				accountReciver: iban
			}
		})
		return res.status(200).json(accoutToCredit)
	} catch (error) {
		return res.status(500).json({ massage: "Server was crached" })
	}
}
export const createTransaction = async (req: Request, res: Response) => {
	try {
		if (!isTypeValide(req.body.transactionType)) {
			return res.status(400).json({
				message: `Le type de la transaction 'transactionType' est incorrect. les types acceptés sont : ${[...availableTransactionTypes]}`
			})
		}
		const { accountEmmiterIban, amount, transactionType } = req.body;
		const accountReciverIban: string = transactionType != "transfert" ? "null" : req.body.accountReciver;
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
		if (emmiterAccount.type === "Bloqué" && transactionType !== "credit") {
			return res.status(400).json(
				{
					message: `Il est impossible de faire un retrait ou un trensfert à partie d'un compte blocké.`
				}
			)
		}
		if (accountEmmiterIban == accountReciverIban) {
			return res.status(400).json(
				{
					message: `Impossible de faire des transactions sur un même compte`
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
					message: `Le montant saisi est supérieur au montant disponible sur le compte. Le montant disponible est de  ${emmiterAccount.balance}`
				});
			}
			if (!(transactionType === "debit")) {
				reciverAcount = await prisma.account.findUnique({ where: { iban: accountReciverIban } });
				if (!reciverAcount) {
					reciverAcount = await prisma.subAccount.findUnique({ where: { iban: accountReciverIban } });
				}
				if (!reciverAcount) {
					return res.status(400).json({
						message: `Aucun compte de reception n'a ce IBAN : ${accountReciverIban}`
					})
				} else {
					const updateAmount: number = reciverAcount.balance + +amount
					try {
						await prisma.account.update({
							where: { iban: accountReciverIban }, data: { balance: updateAmount }
						});
					} catch (error) {
						await prisma.subAccount.update({
							where: { iban: accountReciverIban },
							data: { balance: updateAmount }
						})
					}
				}
			}
		} else {
			newAmount = emmiterAccount.balance + +amount;
		}
		try {
			await prisma.account.update(
				{
					where: { iban: emmiterAccount.iban }, data: { balance: newAmount }
				}
			);
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
					amount: +amount,
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
					amount: +amount,
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

export const changeStatus = async (req: Request, res: Response) => {
	const { id, newStatus }: { id: number, newStatus: string } = req.body
	try {
		const { status, message, user } = await getUserByToken(req, res)
		if (status !== 200 || !user) {
			return res.status(status).json({ message })
		}
		if (user.role != 'admin') {
			return res.status(400).json({ message: "Seul les administrateur peuvent changer l'etat d'une transaction" })
		}
		if (newStatus !== "Accepté" && newStatus !== "Rejeté") {
			return res.status(400).json({ message: "Le status 'newStatus' est invalide, entrez : Accepté ou Rejeté " })
		}
		if (!id) {
			return res.status(400).json({ message: "L'identifiant 'id' de la transaction est requis" })
		}

		const transaction = await prisma.transaction.update({
			where: { id: +id },
			data: { status: newStatus }
		});
		return res.status(200).json(transaction);
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
			return res.status(404).json({ message: `Aucune transaction ne correspond à ce identifiant : ${id}` })
		}
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getUserTransactions = async (req: Request, res: Response) => {
	try {
		const { status, message, user } = await getUserByToken(req, res)
		if (status !== 200 || !user) {
			return res.status(status).json({ message })
		}

		const take = Number(req.query.take) ?? undefined;
		const skip = Number(req.query.skip) ?? undefined;

		let transactionStatus = req.query.status as string | undefined
		if (transactionStatus === "false") {
			transactionStatus = undefined
		}

		let typeOfAccount = req.query.typeOfAccount as string | undefined
		if (typeOfAccount === "false") {
			typeOfAccount = undefined
		}
		const userAccounts = await prisma.account.findUnique(
			{
				select: { iban: true },
				where: {
					userId: user.id,
				}
			}
		)
		const userSubAccouns = await prisma.subAccount.findMany(
			{
				select: { iban: true },
				where: {
					accountParentIban: userAccounts?.iban,
					type: typeOfAccount
				}
			}
		)
		const userSubAccounsIBAN = userSubAccouns.map(({ iban }) => iban)
		const accounttrans = await prisma.transaction.findMany({
			where: {
				status: transactionStatus,
				OR: [
					{ accountEmmiterIban: typeOfAccount ? (typeOfAccount != "Courant" ? undefined : userAccounts?.iban) : userAccounts?.iban },
					{
						subAccountIban: {
							in: userSubAccounsIBAN
						}
					}
				]
			},
			take,
			skip
		})

		let transactions: any[] = []

		for (const trans of accounttrans) {
			const reciver = await prisma.user.findFirst(
				{
					where: {
						Account: {
							OR: [
								{
									iban: trans.accountReciver
								},
								{
									SubAccount: {
										some: {
											iban: trans.accountReciver
										}
									}
								}
							]
						}
					},
					select: {
						id: true,
						email: true,
						name: true
					}
				}
			)

			if (trans.accountEmmiterIban) {
				trans.subAccountIban = trans.accountEmmiterIban
			}
			transactions.push({ ...trans, reciver })
		}
		const totalRecords = await prisma.transaction.count({
			where: {
				status: transactionStatus,
				OR: [
					{ accountEmmiterIban: typeOfAccount ? (typeOfAccount != "Courant" ? undefined : userAccounts?.iban) : userAccounts?.iban },
					{
						subAccountIban: {
							in: userSubAccounsIBAN
						}
					}
				]
			}
		})
		const currentPage = skip ? skip : 1;
		return res.status(200).json({ currentPage, totalRecords, transactions })
	} catch (error) {
		return res.status(500).json({ message: "Le serveur a crashé", error })
	}
}

export const getAllTransactions = async (req: Request, res: Response) => {
	const take = Number(req.query.pageSize) || undefined;
	const skip = Number(req.query.currentPage) || undefined;
	try {
		const transaction = await prisma.transaction.findMany(
			{
				where: { transactionType: "transfert" },
				take,
				skip
			}
		);
		if (!transaction) {
			return res.status(200).json({ message: `nothing found`, transaction })
		}
		const totalRecords: number = await prisma.transaction.count();
		const totalPages: number = take ? Math.ceil(totalRecords / take) : 1;
		const currentPage = skip ? skip : 1;

		let transactions: any[] = []

		for (const trans of transaction) {
			const reciver = await prisma.user.findFirst(
				{
					where: {
						Account: {
							OR: [
								{
									iban: trans.accountReciver
								},
								{
									SubAccount: {
										some: {
											iban: trans.accountReciver
										}
									}
								}
							]
						}
					},
					select: {
						name: true
					}
				}
			)
			if (trans.accountEmmiterIban) {
				trans.subAccountIban = trans.accountEmmiterIban
			}
			transactions.push({ ...trans, reciver: reciver?.name })
		}

		return res.status(200).json({ totalRecords, totalPages, currentPage, transactions });
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

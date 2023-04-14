import { Request, Response } from "express";
import * as iban from "ibannumber-generator";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import * as bcryptjs from 'bcryptjs'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ibanValidator } from "../common/validator";
import { createSubAccouteValidator } from "./validator";

export const createSubAccount = async (req: Request, res: Response) => {
	try {
		const IBAN = iban.buildIban("Ivory_Coast");
		const isValidate = createSubAccouteValidator.validate({ iban: IBAN, ...req.body }).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		const password = await bcryptjs.hash(req.body.password, 10);
		const email = req.body.email || "nul"
		const { name, number, currency, bic, type, parentAccountIban } = req.body;
		const balance = +req.body.balance
		const account = await prisma.subAccount.create({ data: { iban: IBAN, name, number, balance, currency, bic, type, email, password, AccountParent: { connect: { iban: parentAccountIban } } } })
		return res.status(201).json(account)
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				const target: string[] = error.meta!['target'] as string[]
				return res.status(400).json({ message: `Account with this ${target[0]} is already exist` })
			} else if (error.code === 'P2025') {
				return res.status(400).json({ message: `no parent Account with iban ${req.body.parentAccountIban}` })
			}
		}
		return res.status(500).json({ message: "server was crashed", error })
	}
}


export const getOneSubAccount = async (req: Request, res: Response) => {
	try {
		const isValidateIban = ibanValidator(req.params.id)
		if (!isValidateIban) {
			return res.status(400).json({ message: "subaccount IBAN format is not correct" })
		}
		const subAccount = await prisma.subAccount.findUnique({
			where: {
				iban: req.params.id.toUpperCase()
			}
		})
		if (!subAccount) {
			return res.status(404).json({ message: "No sub-account matches to this IBAN" })
		}
		return res.status(200).json({ subAccount })
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getSubAccounts = async (req: Request, res: Response) => {
	const take = Number(req.query.limit) || undefined;
	const skip = Number(req.query.page) || undefined;
	try {
		const accounts = await prisma.account.findMany({ take, skip });
		if (!accounts) {
			return res.status(200).json({ accounts })
		}

		const totalRecords: number = await prisma.account.count();
		const totalPages: number = take ? Math.ceil(totalRecords / take) : 1;
		const currentPage = skip ? skip : 1;

		return res.status(200).json({
			totalRecords, totalPages, currentPage, accounts
		})
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}
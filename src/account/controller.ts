import { Request, Response } from "express";
import { createAccouteValidator, changeAccountTypeValidator } from "./validator";
import { Account, PrismaClient, SubAccount } from "@prisma/client";
import * as Iban from "ibannumber-generator";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as bcryptjs from 'bcryptjs'
import { ibanValidator } from "../common/validator";

const prisma = new PrismaClient();

export const createAccount = async (req: Request, res: Response) => {
	try {
		const IBAN = Iban.buildIban("Ivory_Coast");
		const isValidate = createAccouteValidator.validate({ iban: IBAN, ...req.body }).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		req.body.password = await bcryptjs.hash(req.body.password, 10);
		const account: Account = await prisma.account.create({ data: { iban: IBAN, ...req.body } })
		return (res.status(201).json(account))
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				const target: string[] = error.meta!['target'] as string[]
				return res.status(400).json({ message: `Account with this ${target[0]} is already exist` })
			}
		}
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getOneAccount = async (req: Request, res: Response) => {
	try {
		const iban = req.params.id.toUpperCase()
		const isValidateIban = ibanValidator(iban)
		if (!isValidateIban) {
			return res.status(400).json({ message: "IBAN format is not correct" })
		}
		const account: Account | null = await prisma.account.findUnique({
			where: {
				iban
			}
		})
		if (!account) {
			return res.status(404).json({ message: "No account matches this IBAN" })
		}
		return res.status(200).json(account)
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getAccounts = async (req: Request, res: Response) => {
	const take = Number(req.query.limit) || undefined;
	const skip = Number(req.query.page) || undefined;
	try {
		const accounts: Account[] = await prisma.account.findMany({ take, skip });
		if (accounts.length === 0) {
			return res.status(200).json(accounts)
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

export const changeAccountType = async (req: Request, res: Response) => {
	try {
		const iban = req.body.iban;
		const type = req.body.newType;
		const password = req.body.password;

		const isValidate = changeAccountTypeValidator.validate({ iban, newType: type, password }).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		let isAccount: boolean = true;
		let emmiterAccount: Account | SubAccount | null
		emmiterAccount = await prisma.account.findUnique({ where: { iban } })
		if (!emmiterAccount) {
			emmiterAccount = await prisma.subAccount.findUnique({ where: { iban } })
			if (!emmiterAccount) {
				return res.status(404).json({ message: `not account with IBAN : ${iban}` })
			}
			isAccount = false;
		}
		const isMatch = await bcryptjs.compare(password, emmiterAccount.password);
		if (!isMatch) {
			return res.status(400).json({ message: `password is not correct` })
		}
		let emmiterUpdate: Account | SubAccount | null;
		if (isAccount) {
			emmiterUpdate = await prisma.account.update({ where: { iban }, data: { type } });
		} else {
			emmiterUpdate = await prisma.subAccount.update({ where: { iban }, data: { type } })
		}
		return res.status(201).json({ emmiterUpdate })
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const removeAccounts = async (req: Request, res: Response) => {
	try {
		const { count } = await prisma.account.deleteMany();
		if (count === 0) {
			return res.status(200).json({ massage: `Accounts list is already empty` })
		}
		return res.status(200).json({ massage: `${count} Accounts has been deleted` })
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}
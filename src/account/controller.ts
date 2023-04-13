import { Request, Response } from "express";
import { createAccouteValidator } from "./validator";
import { PrismaClient } from "@prisma/client";
import * as iban from "ibannumber-generator";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as bcryptjs from 'bcryptjs'
import { ibanValidator } from "../common/validator";

const prisma = new PrismaClient();

export const createAccount = async (req: Request, res: Response) => {
	try {
		const IBAN = iban.buildIban("Ivory_Coast");
		const isValidate = createAccouteValidator.validate({ iban: IBAN, ...req.body }).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		req.body.password = await bcryptjs.hash(req.body.password, 10);
		const account = await prisma.account.create({ data: { iban: IBAN, ...req.body } })
		return res.status(201).json(account)
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

		const isValidateIban = ibanValidator(req.params.id)
		if (!isValidateIban) {
			return res.status(400).json({ message: "IBAN format is not correct" })
		}
		const account = await prisma.account.findUnique({
			where: {
				iban: req.params.id.toUpperCase()
			}
		})
		if (!account) {
			return res.status(404).json({ message: "No account matches this IBAN" })
		}
		return res.status(200).json({ account })
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getAccounts = async (req: Request, res: Response) => {
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

import { Request, Response } from "express";
import { createAccouteValidator } from "./validator";
import { PrismaClient } from "@prisma/client";
import * as iban from "ibannumber-generator";
import * as isIBAN from 'iban-checker';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


const prisma = new PrismaClient();

export const createAccount = async (req: Request, res: Response) => {
	try {
		const IBAN = iban.buildIban("Ivory_Coast");
		const isValidate = createAccouteValidator.validate({ iban: IBAN, ...req.body }).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		const account = await prisma.account.create({ data: { iban: IBAN, ...req.body } })
		return res.status(201).json(account)
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return res.status(400).json({ message: `Account with this ${error.meta?.target[0]} is already exist` })
			}
		}
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getOneAccount = async (req: Request, res: Response) => {
	try {
		const isValidateIban = isIBAN(req.params.id)
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
		return res.status(201).json({ account })
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}
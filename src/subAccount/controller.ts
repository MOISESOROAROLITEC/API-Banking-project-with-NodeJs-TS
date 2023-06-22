import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ibanValidator } from "../common/validator";
import { createSubAccouteValidator } from "./validator";
import { generateIban } from "../shared/functions";


const prisma = new PrismaClient();

export const createSubAccount = async (req: Request, res: Response) => {
	try {
		const IBAN = generateIban()
		const isValidate = createSubAccouteValidator.validate(
			{ iban: IBAN, ...req.body }
		).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		const { currency, bic, type, parentAccountIban } = req.body;
		const balance = +req.body.balance
		const account = await prisma.subAccount.create({
			data: {
				iban: IBAN, balance: balance | 0, currency, bic, type,
				AccountParent: { connect: { iban: parentAccountIban } }
			}
		})
		return res.status(201).json(account)
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				const target: string[] = error.meta!['target'] as string[]
				return res.status(400).json({ message: `Le compte avec ce ${target[0]} existe déjà` })
			} else if (error.code === 'P2025') {
				return res.status(400).json(
					{ message: `Aucun compte parent n'a pour IBAN ${req.body.parentAccountIban}` }
				)
			}
		}
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getOneSubAccount = async (req: Request, res: Response) => {
	try {
		const isValidateIban = ibanValidator(req.params.id)
		if (!isValidateIban) {
			return res.status(400).json({ message: "Le format de l'IBAN du sous compte est incorrect" })
		}
		const subAccount = await prisma.subAccount.findUnique({
			where: {
				iban: req.params.id.toUpperCase()
			}
		})
		if (!subAccount) {
			return res.status(404).json({ message: "Ce IBAN ne correspond à aucun sous-compte" })
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

	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const removeSubAccounts = async (req: Request, res: Response) => {
	try {
		const { count } = await prisma.subAccount.deleteMany();
		if (+count === 0) {
			return res.status(200).json({ message: `La liste des sous-comptes est déjà vide` })
		}
		return res.status(200).json(
			{
				count,
				message: `${count} ${count > 1 ? "comptes ont" : "compte à"} été supprimé`
			}
		)
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}
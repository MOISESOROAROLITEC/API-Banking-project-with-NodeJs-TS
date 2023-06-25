import { Request, Response } from "express";
import { createAccouteValidator, changeAccountTypeValidator } from "./validator";
import { Account, PrismaClient, SubAccount } from "@prisma/client";
import * as Iban from "ibannumber-generator";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ibanValidator } from "../common/validator";
import { getUserByToken } from "../shared/functions";

const prisma = new PrismaClient();

export const createAccount = async (req: Request, res: Response) => {
	try {
		const IBAN = Iban.buildIban("Ivory_Coast");
		const isValidate = createAccouteValidator.validate({ iban: IBAN, ...req.body }).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		req.body.password = await (req.body.password, 10);
		const account: Account = await prisma.account.create({ data: { iban: IBAN, ...req.body } })
		return (res.status(201).json(account))
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				const target: string[] = error.meta!['target'] as string[]
				return res.status(400).json({ message: `Un compte avec ce ${target[0]} existe déjà` })
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
			return res.status(400).json({ message: "Le format de l'IBAN est incorrect" })
		}
		const account: Account | null = await prisma.account.findUnique({
			where: {
				iban
			}
		})
		if (!account) {
			return res.status(404).json({ message: "Ce IBAN ne correspond à aucun compte" })
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
		return res.status(200).json(accounts)
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getUserAccounts = async (req: Request, res: Response) => {
	try {
		const { status, message, user } = await getUserByToken(req, res)
		if (status !== 200 || !user) {
			return res.status(status).json({ message })
		}
		const userAccounts = await prisma.account.findUnique({ where: { userId: user.id } })
		const userSubAccouns = await prisma.subAccount.findMany(
			{
				where: {
					accountParentIban: userAccounts?.iban
				}
			}
		)
		return res.status(200).json(
			{
				account: {
					...userAccounts,
					userId: undefined,
					createAt: undefined,
					updateAt: undefined
				},
				subAccount: userSubAccouns
			}
		)
	} catch (error) {
		return res.status(500).json({ message: "Le serveur a craché" })
	}
}

export const changeAccountType = async (req: Request, res: Response) => {
	try {
		const { status, message, user } = await getUserByToken(req, res)
		if (status !== 200 || !user) {
			return res.status(status).json({ message })
		}

		const iban = req.body.iban;
		const type = req.body.newType;

		const isValidate = changeAccountTypeValidator.validate({ iban, newType: type }).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		let isAccount: boolean = true;
		let emmiterAccount: Account | SubAccount | null
		emmiterAccount = await prisma.account.findUnique({ where: { iban } })
		if (!emmiterAccount) {
			emmiterAccount = await prisma.subAccount.findUnique({ where: { iban } })
			if (!emmiterAccount) {
				return res.status(404).json({ message: `Aucun compte n'a ce IBAN : ${iban}` })
			}
			isAccount = false;
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

export const removeOneAccount = async (req: Request, res: Response) => {
	try {
		const Account = await prisma.account.delete({ where: { iban: req.params.iban } })
		if (!Account) {
			return res.status(404).json({ message: `Ce conpte est introuvable` })
		}
		return res.status(200).json(Account)
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const removeAccounts = async (req: Request, res: Response) => {
	try {
		const { count } = await prisma.account.deleteMany();
		if (count === 0) {
			return res.status(200).json({ message: `La liste des conptes est déjà vides` })
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
import { Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { createUserValidator, loginValidator, updateUserValidator } from "./validator";
import { hashPassword, decryptToken, generateIban, generateToken, comparePassword, getUserByToken } from "../shared/functions";
import { ERROR } from "sqlite3";

const prisma = new PrismaClient()

export const userCreate = async (req: Request, res: Response) => {
	try {
		const { name, email, password, role } = req.body;

		const isValidate = createUserValidator.validate(req.body).error?.details[0].message;
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		const passwordHashed = await hashPassword(password)
		const user = await prisma.user.create({
			data: {
				name: name,
				role: role,
				email: email,
				password: passwordHashed
			}
		})
		const token = generateToken({ id: user.id, name: user.name })

		await prisma.user.update(
			{
				data: {
					token: token
				},
				where: {
					id: user.id
				}
			}
		)
		const iban = generateIban()
		await prisma.account.create(
			{
				data: {
					iban, balance: 0, currency: "OXF", bic: "DEUIUREI", type: "Courant",
					User: { connect: { id: user.id } }
				}
			}
		)
		return res.status(200).json({ name: user.name, email: user.email, token: token });
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return res.status(401).json({ message: `Cette adresse email est déjà utilisé` })
			}
		}
		return res.status(500).json({ message: "server was " })
	}
}

export const createSuperAdmin = async (data: { name: string, email: string, password: string, role: string }) => {
	try {
		const { name, email, password, role } = data;

		const isValidate = createUserValidator.validate({ name, email, password, role }).error?.details[0].message;
		if (isValidate) {
			return new Error(isValidate);

		}
		const passwordHashed = await hashPassword(password)
		const user = await prisma.user.create({
			data: {
				name: name,
				role: role,
				email: email,
				password: passwordHashed
			}
		})
		const token = generateToken({ id: user.id, name: user.name })

		await prisma.user.update(
			{
				data: {
					token: token
				},
				where: {
					id: user.id
				}
			}
		)
		return 'succès'
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return new Error(`Cette adresse email est déjà utilisé`);
			}
		}
		return new Error("server was")
	}
}

export const changePassword = async (req: Request, res: Response) => {
	try {
		const { password } = req.body;
		const authorization = req.headers.authorization
		if (!authorization || !authorization.startsWith('Bearer ')) {
			return res.status(400).json({ message: "Faite la requete avec un Bearer token" })
		}
		const token = authorization.substring(7)
		const tokenDecrypted = decryptToken(token) as string
		if (!tokenDecrypted) {
			return res.status(401).json({ message: "Le token est incorrect" })
		}

		const passwordHashed = await hashPassword(password)

		const user = await prisma.user.update(
			{
				where: { email: tokenDecrypted },
				data: {
					password: passwordHashed
				}
			},
		)
		if (!user) {
			return res.status(404).json({ message: "L'email ne correspond à aucun utilisateur" })
		}
		return res.status(200).json({ message: "Le mot de passe a bien été changé" })
	} catch (error) {
		return res.status(500).json({ message: "Le serveur a craché" })
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body
		const isValidate = loginValidator.validate(req.body).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(404).json({ message: "L'email ou le mot de passe est incorrect" });
		}
		const isMatch = comparePassword(password, user.password);
		if (!isMatch) {
			return res.status(404).json({ message: "L'email ou le mot de passe est incorrect" });
		}
		const token = generateToken({ id: user.id, name: user.name })
		return res.status(200).json({ name: user.name, email: user.email, role: user.role, token });

	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error });
	}
}
export const userList = async (req: Request, res: Response) => {
	const take = Number(req.query.limit) || undefined;
	const skip = Number(req.query.page) || undefined;

	const users = await prisma.user.findMany({ select: { name: true, email: true, role: true }, take, skip })

	return res.status(200).json({
		users
	})
}
export const update = async (req: Request, res: Response) => {
	try {
		const { status, message, user } = await getUserByToken(req, res)
		if (status !== 200 || !user) {
			return res.status(status).json({ message })
		}
		const { name, email, oldPassword, newPassword, confirmPassword } = req.body
		const isValidate = updateUserValidator.validate(req.body).error?.details[0].message;
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		let passwordHashed = undefined
		if (oldPassword && newPassword && confirmPassword) {
			if (newPassword != confirmPassword) {
				return res.status(400).json({ message: "Le nouveau mot de passe ne correspond pas au mot de pass de confirmation" })
			}
			const oldPasswordMatchWithHash = comparePassword(oldPassword, user.password)
			if (!oldPasswordMatchWithHash) {
				return res.status(400).json({ message: "L'ancien mot de passe ne correspond pas !" })
			}
			passwordHashed = await hashPassword(newPassword)
		}
		const newUser = await prisma.user.update({ where: { email: user.email }, data: { email, name, password: passwordHashed } })
		if (!newUser) {
			return res.status(404).json({ message: "Cet utilisateur est introuvable" })
		}
		const token = generateToken({ id: newUser.id, name: newUser.name })
		return res.status(200).json({ token, name: newUser.name, email: newUser.email, role: user.role })
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return res.status(404).json({ message: "Cet utilisateur est introuvable dans la base de données" })
			} else if (error.code === 'P2002') {
				const target: string[] = error.meta!['target'] as string[]
				return res.status(400).json({ message: `Un compte avec ce ${target[0]} existe déjà` })
			}
		}
		return res.status(500).json({ message: "server was crashed", error })
	}
}

export const getUserInformations = async (req: Request, res: Response) => {
	try {
		const { status, message, user } = await getUserByToken(req, res);
		if (status !== 200 || !user) {
			return res.status(status).json({ message })
		}
		return res.status(200).json({ ...user, token: undefined, password: undefined, id: undefined })
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return res.status(404).json({ message: "Cet utilisateur est introuvable dans la base de données" })
			}
		}
		return res.status(500).json({ message: "server was crashed", error })
	}
}
export const removeUsers = async (req: Request, res: Response) => {

	const { count } = await prisma.user.deleteMany()
	return res.status(200).json({ count })
}
import * as jwt from "jsonwebtoken";
import * as bcrypt from 'bcryptjs'
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { GetUserByToken, tokenDecryptedInterface } from "../common/constantes";

const prisma = new PrismaClient()

export function generateIban(): string {
	const accountNumberLength = 16;
	let accountNumber = '';
	for (let i = 0; i < accountNumberLength; i++) {
		const digit = Math.floor(Math.random() * 10);
		accountNumber += digit.toString();
	}
	return accountNumber;
}

export function generateToken(userData: object): string {
	const options = { expiresIn: '1d' };
	const secretKey = process.env.SECRET_KEY || "";
	return jwt.sign(userData, secretKey, options);
}

export function generateResetToken(email: string): string {
	const options = { expiresIn: '1d' };
	const secretKey = process.env.SECRET_KEY || "";
	return jwt.sign(email, secretKey, options);
}

export function decryptToken(token: string): string | jwt.JwtPayload | undefined {

	const secretKey = process.env.SECRET_KEY || "je suis la clée privée par defaut qu'il faut absolument changer";

	try {
		return jwt.verify(token, secretKey)
	} catch (error) {
		undefined
	}
}

export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
	return bcrypt.compareSync(password, hash)
}

export const verifyEmail = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) {
			return res.status(404).json({ message: "L'email ne correspond à aucun utilisateur" })
		}
		const resetToken = generateResetToken(email);
		return res.status(200).json({ token: resetToken })
	} catch (error) {
		return res.status(500).json({ message: "Le serveur a craché" })
	}
}

export const getUserByToken = async (req: Request, res: Response): Promise<GetUserByToken> => {
	try {
		const authorization = req.headers.authorization
		if (!authorization || !authorization.startsWith('Bearer ')) {
			return { status: 400, message: "Faite la requete avec un Bearer token" }
		}
		const token = authorization.substring(7)
		const tokenDecrypted = decryptToken(token) as tokenDecryptedInterface | undefined
		if (!tokenDecrypted) {
			return { status: 401, message: "Le token est incorrect" }
		}
		const user = await prisma.user.findUnique({ where: { id: tokenDecrypted.id } })
		if (!user) {
			return { status: 404, message: "L'utilisateur de ce token est introuvable", user }
		}
		return { status: 200, message: "ok", user }
	} catch (error) {
		return { status: 500, message: "Le serveur a craché" }
	}
}

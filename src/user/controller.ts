import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { generateToken } from "../common/validator";
import * as bcrypt from 'bcryptjs'
import { createUserValidator, loginValidator } from "./validator";


const prisma = new PrismaClient()

export const userCreate = async (req: Request, res: Response) => {
	const { name, email, password } = req.body;

	const isValidate = createUserValidator.validate(req.body).error?.details[0].message
	if (isValidate) {
		return res.status(400).json({ message: isValidate })
	}

	try {
		const passwordHashed = await bcrypt.hash(password, 10)
		const user = await prisma.user.create({
			data: {
				name: name,
				email: email,
				password: passwordHashed
			}
		})
		const token = generateToken({ id: user.id, name: user.name })
		return res.status(200).json({ token });
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return res.status(401).json({ message: `User with this email is already exist` })
			}
		}
		return res.status(500).json({ message: "server was " })
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body
		const isValidate = loginValidator.validate(req.body).error?.details[0].message
		if (isValidate) {
			return res.status(400).json({ message: isValidate })
		}
		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) {
			return res.status(400).json({ message: "email or passwor is not correct" });
		}
		const isMatch = bcrypt.compareSync(password, user.password);
		const token = generateToken({ id: user.id, name: user.name })
		if (isMatch) {
			return res.status(200).json({ token });
		} else {
			return res.status(400).json({ message: "email or passwor is not correct" });
		}
	} catch (error) {
		return res.status(500).json({ message: "server was crashed", error });
	}
}

export const userList = async (req: Request, res: Response) => {
	const take = Number(req.query.limit) || undefined;
	const skip = Number(req.query.page) || undefined;

	const users = await prisma.user.findMany({ select: { name: true, email: true }, take, skip })

	return res.status(200).json({
		users
	})
}
export const removeUsers = async () => {

	await prisma.user.deleteMany()

}
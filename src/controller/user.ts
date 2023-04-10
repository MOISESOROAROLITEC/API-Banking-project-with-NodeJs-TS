import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const adminCreate = async (req: Request, res: Response) => {
	const body = req.body;
	try {
		const newUser = await prisma.user.create({
			data: {
				name: body.name,
				email: body.email,
				password: body.password
			}
		})
		console.log(newUser);

		return res.status(200).json({ newUser });
	} catch (error) {
		console.log("l'erreur est ; ", error);
		return res.status(500).json({ message: "errrue serveur" })

	}
}

import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcryptjs'
import { DeepMockProxy } from "jest-mock-extended"

const prismaMock = {
	user: {
		create: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn()
	},
} as DeepMockProxy<PrismaClient>;

jest.mock("@prisma/client", () => ({
	PrismaClient: jest.fn().mockImplementation(() => prismaMock)
}))

import { login, update, userCreate } from "./controller";
import { Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

describe("Test user routes", () => {
	describe("Test create a user", () => {
		const user = {
			name: "sorosoro",
			email: "soroso@rogmail.com",
			password: "123456789"
		};
		let req: Request;
		let res: Response;
		req = {
			body: user
		} as Request
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		} as unknown as Response;
		it("should create a user account and return status code 200 and token", async () => {
			prismaMock.user.create.mockResolvedValue({ id: 0, ...user })
			await userCreate(req, res)

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) })
		});

		it("should return 401 and a message to say : User with this email is already exist", async () => {

			prismaMock.user.create.mockRejectedValueOnce(new PrismaClientKnownRequestError('Validation error', { code: "P2002", clientVersion: "458" }))
			await userCreate(req, res);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenLastCalledWith({ message: `User with this email is already exist` });

		});
	});

	describe("Test to login a user", () => {
		const user = {
			email: "sorom@oise.com",
			password: "hi, im pass"
		}
		let req: Request;
		let res: Response;
		req = {
			body: user
		} as Request
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		} as unknown as Response;

		it("Should find user return status code 200 and token", async () => {
			prismaMock.user.findUnique.mockResolvedValueOnce({ ...user, id: 1, name: "SORO MOISE" })
			jest.spyOn(bcrypt, "compareSync").mockResolvedValueOnce(true as never);

			await login(req, res)

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) });
		})

		it("Should not find user return status code 404 and error message", async () => {
			prismaMock.user.findUnique.mockResolvedValueOnce(null)
			await login(req, res)

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "email or passwor is not correct" });
		});
	});

	describe("Update user information", () => {
		const user = {
			userEmail: "sorom@oise.com",
			name: "soro",
			password: "12345678",
		}
		let req: Request;
		let res: Response;
		req = {
			body: user
		} as Request;
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		} as unknown as Response;

		it("Should error 404 and a message to say cannot find this user", async () => {
			prismaMock.user.update.mockRejectedValueOnce(new PrismaClientKnownRequestError('Validation error', { code: "P2025", clientVersion: "458" }))

			await update(req, res)

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "cannot find this user in database" })
		})

		it("Should update user account", async () => {
			prismaMock.user.update.mockResolvedValue({ id: 0, name: "soro", password: "log", email: "im soro" })

			await update(req, res)

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) })
		});
	})

});
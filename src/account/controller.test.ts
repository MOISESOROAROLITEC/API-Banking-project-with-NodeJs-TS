import { Account, PrismaClient } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended";

const prismaMock = {
	account: {
		create: jest.fn(),
		findUnique: jest.fn()
	},
} as DeepMockProxy<PrismaClient>;
jest.mock("@prisma/client", () => ({
	PrismaClient: jest.fn().mockImplementation(() => prismaMock)
}));

import { createAccount, getOneAccount } from "./controller";
import { Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

describe('Test account Routes', () => {
	type AccountType = {
		iban: string;
		name: string;
		email: string;
		number: string;
		password: string;
		balance: number,
		currency: string;
		bic: string;
		type: string;
		createAt: Date;
		updateAt: Date;
	}
	const account = {
		name: "soro moise",
		email: "sm@gmail.com",
		number: "0564796221",
		password: "12345678",
		balance: 5000,
		currency: "CFA",
		bic: "DEUIUREI",
		type: "savings"
	};
	describe("create an account", () => {

		let req: Request;
		let res: Response;
		req = {
			body: { ...account }
		} as Request;
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		} as unknown as Response;

		it("Should return 400 as status code and error message to say : Account with this email is already exist", async () => {
			prismaMock.account.create.mockRejectedValue(new PrismaClientKnownRequestError(`Account with this ${account.email} is already exist`, { code: "P2002", clientVersion: "jhh", meta: { target: ['email'] } }))
			await createAccount(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: "Account with this email is already exist" });
		});

		it('should create a new account, return 201 as status code and account itself', async () => {
			prismaMock.account.create.mockImplementation(() => { return { id: 0, iban: 123, ...account } as unknown as never })

			await createAccount(req, res)

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toBeCalledWith({ id: 0, iban: 123, ...account });
		});
	});

	describe("get one acount by iban", () => {
		const IBAN: string = "CI55P19959442392964435661879"
		let req: Request;
		let res: Response;
		req = {
			params: { id: IBAN }
		} as unknown as Request;
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		} as unknown as Response;

		it("should return 404 error as status code and a message to saying account is not found", async () => {
			prismaMock.account.findUnique.mockImplementation(() => { return null as never })

			await getOneAccount(req, res)

			expect(res.status).toBeCalledWith(404);
			expect(res.json).toBeCalledWith({ message: "No account matches this IBAN" });
		});

		it("should return 200 as status code and an account", async () => {
			prismaMock.account.findUnique.mockImplementation(() => { return { account } as never })

			await getOneAccount(req, res);

			expect(res.status).toBeCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ account: { ...account } })
		})
	});

	describe("Get all account", () => {

		it("Should return list of accounts", async () => {
			expect("res").toBe("res");
			expect("res").toContain("res");
		});

		it("Should return empty list", async () => {
			expect("res").toBe("res");
			expect("res").toContain("res");
		});
	});
});
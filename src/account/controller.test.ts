import { PrismaClient } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended";

const prismaMock = {
	account: {
		create: jest.fn()
	},
} as DeepMockProxy<PrismaClient>;
jest.mock("@prisma/client", () => ({
	PrismaClient: jest.fn().mockImplementation(() => prismaMock)
}));

import { createAccount } from "./controller";
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
	describe("create an account", () => {
		const account = {
			name: "soro moise",
			email: "sm@gmail.com",
			number: "0564796221",
			password: "jesuislepppassword",
			balance: 5000,
			currency: "CFA",
			bic: "DEUIUREI",
			type: "savings"
		};

		let req: Request;
		let res: Response;
		req = {
			body: account
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

		it("Should return 400 as status code and error message to say : eamil most bee valid", async () => {
			let newReq = req;
			newReq.body.eamil = "hi"
			await createAccount(newReq, res);

			expect(res.status).toBeCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: '"eamil" is not allowed' });
		});

		it('should create a new account', async () => {
			expect("res").toBe("res");
			expect("res").toContain("res");
		});

		it('should return a status code 400 and a message saying that the user already exists.', async () => {
			expect("res").toBe("res");
			expect("res").toContain("res");
		});
	});

	describe("get one acount by iban", () => {
		it("should return 400 error as status code and a message to saying iban format is not correct", async () => {
			expect("res").toBe("res");
			expect("res").toContain("res");
		});

		it("should return 404 error as status code and a message to saying account is not found", async () => {
			expect("res").toBe("res");
			expect("res").toContain("res");
		});

		it("should return 200 as status code and an account", async () => {
			expect("res").toBe("res");
			expect("res").toContain("res");
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
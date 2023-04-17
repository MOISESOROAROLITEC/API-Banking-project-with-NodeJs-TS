const supertest = require('supertest');
// import { Request } from 'express';
import app from '../script';

const req = supertest(app);

describe('Test account Routes', () => {
	const account = {
		name: "soro moise",
		email: "sm@gmail.com",
		number: "0005000000",
		password: "123456789",
		balance: 5000,
		currency: "CFA",
		bic: "DEUIUREI",
		type: "blocked"
	};
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
	beforeEach(async () => {
		await req.delete("/account/remove-all");
	});



	describe("create an account", () => {
		const email = "sorogmai.com";
		it("Should return 400 as status code and error message", async () => {
			const response = await req.post("/account/create").send({ ...account, email });
			expect(response.status).toBe(400);
			expect(response.body.message).toContain('"email" must be a valid email');
		});

		it('should create a new account', async () => {
			const response = await req.post('/account/create').send(account);
			expect(response.status).toBe(201);
			expect(response.body.name).toEqual(account.name);
			expect(response.body.balance).toEqual(account.balance);
			expect(response.body.email).toEqual(account.email);
		});

		it('should return a status code 400 and a message saying that the user already exists.', async () => {
			await req.post('/account/create').send({ ...account, email: "sm@gmail.com" });
			const response = await req.post('/account/create').send({ ...account, email: "sm@gmail.com" });
			expect(response.status).toBe(400);
			expect(response.body.message).toEqual("Account with this email is already exist");
		});
	});

	describe("get one acount by iban", () => {
		it("should return 400 error as status code and a message to saying iban format is not correct", async () => {
			const res = await req.get("/account/56768jiyjgfh")
			expect(res.status).toBe(400)
			expect(res.body.message).toBe("IBAN format is not correct")
		});

		it("should return 404 error as status code and a message to saying account is not found", async () => {
			const res = await req.get("/account/CI31N5344666581293329912781")
			expect(res.status).toBe(404)
			expect(res.body.message).toBe("No account matches this IBAN")
		});

		it("should return 200 as status code and an account", async () => {
			const iban = await req.post('/account/create').send({ ...account, number: "0589635874", email: "sfdjf@gmail.com" });

			const res = await req.get(`/account/${iban.body.iban}`)

			expect(res.status).toBe(200)
			expect(res.body).toMatchObject<AccountType>(res.body)
		})
	});

	describe("Get all account", () => {

		it("Should return list of accounts", async () => {
			const res = await req.get("/accounts");
			expect(res.body.accounts).toBeTruthy();
		});

		it("Should return empty list", async () => {
			await req.get("/account/remove-all");
			const res = await req.get("/accounts");
			expect(res.status).toBe(200)
			expect(res.body.accounts).toMatchObject([]);
		});
	});
});
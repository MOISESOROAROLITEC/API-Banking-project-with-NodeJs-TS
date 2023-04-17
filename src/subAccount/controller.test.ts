const supertest = require('supertest');
import app from '../script';

const req = supertest(app);

// import { req } from "../common/imports.test";
beforeEach(async () => {
	await req.delete("http://localhost:3000/subaccount/remove-all");
})

describe("test SubAccount routes", () => {
	const subAccount = {
		name: "soro moise",
		email: "sm@gmail.com",
		number: "0005000000",
		password: "123456789",
		balance: 5000,
		currency: "CFA",
		bic: "DEUIUREI",
		type: "blocked"
	};
	describe("create a SubAccount", () => {
		const email = "sorogmai.com";
		it("Should return 400 as status code and error message", async () => {
			const res = await req.post("subaccount/create").send({ ...subAccount, email });
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/is required$/);
		});

	})
})
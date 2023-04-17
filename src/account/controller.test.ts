import { createAccount } from './controller';
import { Request, Response } from 'express';
import { createAccouteValidator } from './validator';

jest.mock('./validator');
jest.mock('bcryptjs');
jest.mock('../../client');

describe('createAccount', () => {
	const Account = {
		email: "blo@email.com",
		name: "blo",
		number: "0725500054",
		password: "123456789",
		balance: 5000,
		currency: "CFA",
		bic: "DEUIUREI",
		type: "blocked"
	}
	const req = { body: { Account } } as Request;
	const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return 400 if validation fails', async () => {
		const errorMessage = 'Invalid data';
		(createAccouteValidator.validate as jest.Mock).mockReturnValueOnce({
			error: { details: [{ message: errorMessage }] },
		});

		await createAccount(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
	});
});

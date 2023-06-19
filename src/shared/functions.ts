import * as jwt from "jsonwebtoken";


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
	// const options = { expiresIn: '1d' };
	const secretKey = process.env.SECRET_KEY || "";
	return jwt.sign(email, secretKey);
}

export function decryptToken(token: string): string | jwt.JwtPayload | undefined {

	const secretKey = process.env.SECRET_KEY;
	if (!secretKey) {
		return undefined
	}
	try {
		return jwt.verify(token, secretKey)
	} catch (error) {
		undefined
	}


}
import * as dotenv from 'dotenv'

dotenv.config()

export const availableKeys = ["name", "email", "password"];

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}
export function isValideName(name: string): boolean {
	return name.length >= 3
}

export function isValidePassword(password: string): boolean {
	return password.length >= 8
}

export function isValideUserData(name: string, email: string, password: string): boolean {
	return isValideName(name) && isValidEmail(email) && isValidePassword(password);
}

export function ibanValidator(iban: string): boolean {
	const regex: RegExp = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]{0,15})?$/;
	return regex.test(iban);
}
import { User } from "./types";

export const availableTransactionTypes: string[] = ["debit", "credit", "transfert"];

export interface tokenDecryptedInterface {
	id: number;
	name: string;
	password?: string;
	email?: string
	iat: number;
	exp: number;
}

export interface GetUserByToken {
	status: number,
	message: string,
	user?: User | null
}
export const availableTransactionTypes: string[] = ["debit", "credit", "transfer"];

export interface tokenDecryptedInterface {
	id: number;
	name: string;
	iat: number;
	exp: number;
}
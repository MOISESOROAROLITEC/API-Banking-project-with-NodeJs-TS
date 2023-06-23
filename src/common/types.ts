
export type User = {
	name: string
	email: string
	password: string,
	role: string,
	token?: string | null
	id?: number
}

export type Account = {
	iban: string
	name: string
	number: string
	email: string
	password: string
	balance: number
	currency: string
	bic: string
	type: string
	createAt: Date
	updateAt: Date
}

export type SubAccount = {
	iban: string
	name: string
	number: string
	password: string
	balance: number
	currency: string
	bic: string
	type: string
	createAt: Date
	updateAt: Date
	accountParentIban: string | null
}
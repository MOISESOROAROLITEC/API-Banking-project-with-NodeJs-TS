
export type User = {
	id: number
	name: string
	email: string
	password: string
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
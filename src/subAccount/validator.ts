import Joi = require("joi");

export const createSubAccouteValidator = Joi.object({
	iban: Joi.string()
		.required(),
	name: Joi.string()
		.min(3).message("name length must be longer than 2 characters")
		.max(30).message("name length can not be longer than 30 characters")
		.required(),
	number: Joi.string()
		.pattern(/^(?:\d{10}|(?:\+|00)225\d{10})$/)
		.message("Incorrect number, please enter a 10 digit number. eg: 0589635874 or 225 0589635874 or 00225 0589635874 or +225 0589635874")
		.required(),
	email: Joi.string()
		.email(),
	password: Joi.string()
		.min(8)
		.max(50)
		.required(),
	balance: Joi.number()
		.required(),
	currency: Joi.string()
		.pattern(/^(CFA|EUR|USD|GBP|JPY|CHF|AUD|CAD|CNY|INR|NZD)$/)
		.message("allow currency : 'CFA', 'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'INR', 'NZD'")
		.required(),
	bic: Joi.string()
		.pattern(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
		.message("BIC format is not correct, eg: DEUIUREI")
		.required(),
	type: Joi.string()
		.pattern(/^(savings|blocked|current)$/)
		.message("allow type : 'savings', 'blocked', 'current'")
		.required(),
	parentAccountIban: Joi.string()
		.pattern(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]{0,15})?$/)
		.message("parent account iban format is not correct")
		.required()
})
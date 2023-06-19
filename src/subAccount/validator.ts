import Joi = require("joi");

export const createSubAccouteValidator = Joi.object({
	iban: Joi.string()
		.required(),
	balance: Joi.number(),
	currency: Joi.string()
		.pattern(/^(OXF|EUR|USD|GBP|JPY|CHF|AUD|CAD|CNY|INR|NZD)$/)
		.message("allow currency : 'OXF', 'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'INR', 'NZD'")
		.required()
		.default("OXF"),
	bic: Joi.string()
		.required(),
	type: Joi.string()
		.pattern(/^(Epargne|Bloqué|Courant)$/)
		.message("Les type valable sont : 'Epargne', 'Bloqué', 'Courant'")
		.required(),
	parentAccountIban: Joi.string()
		.required()
})
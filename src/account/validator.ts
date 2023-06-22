import Joi = require("joi");

export const createAccouteValidator = Joi.object({
	iban: Joi.string()
		.required(),
	balance: Joi.number()
		.required(),
	currency: Joi.string()
		.pattern(/^(OXF|EUR|USD|GBP|JPY|CHF|AUD|CAD|CNY|INR|NZD)$/)
		.message("les devises autorise sont: 'OXF', 'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'INR', 'NZD'")
		.required(),
	bic: Joi.string()
		.pattern(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
		.message("BIC format is not correct, eg: DEUIUREI")
		.required(),
	type: Joi.string()
		.pattern(/^(epargne|blocké|currant)$/)
		.message("allow type : 'epargne', 'blocké', 'currant'")
		.required()
})

export const changeAccountTypeValidator = Joi.object({
	iban: Joi.string()
		.required(),
	newType: Joi.string()
		.pattern(/^(Epargne|Bloqué|Courant)$/)
		.message("allow type : 'Epargne', 'Bloqué', 'Courant'")
		.required()
})
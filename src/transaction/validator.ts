import Joi = require("joi");
import * as iban from "iban-ts";

export const withdrawalValidator = Joi.object({
	accountEmmiterIban: Joi.string()
		.custom((value, helpers) => {
			if (iban.isValid(value)) {
				return value
			} else {
				helpers.error("Iban is nont correct")
			}
		})
		.required(),
	accountPassword: Joi.string()
		.min(8)
		.max(50)
		.required(),
	amount: Joi.number()
		.required(),
});

export const depositValidator = Joi.object({
	emmiterIban: Joi.string()
		.required(),
	reciverIban: Joi.string()
		.required(),
	amount: Joi.number()
		.required(),
	password: Joi.string()
		.min(8)
		.max(50)
		.required(),
	transactionType: Joi.string()
		.pattern(/^(debit|credit|deposit|card)$/)
		.message("allow currency : 'debit', 'credit', 'deposit', 'card'")
		.required(),
	bic: Joi.string()
		.pattern(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
		.message("BIC format is not correct, eg: DEUIUREI")
		.required(),
	type: Joi.string()
		.pattern(/^(savings|blocked)$/)
		.message("allow type : 'savings', 'blocked'")
		.required()
});

export const transferValidator = Joi.object({
	emmiterIban: Joi.string()
		.required(),
	reciverIban: Joi.string()
		.required(),
	amount: Joi.number()
		.required(),
	transactionType: Joi.string()
		.pattern(/^(debit|credit|deposit|card)$/)
		.message("allow currency : 'debit', 'credit', 'deposit', 'card'")
		.required(),
	bic: Joi.string()
		.pattern(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
		.message("BIC format is not correct, eg: DEUIUREI")
		.required(),
	type: Joi.string()
		.pattern(/^(savings|blocked)$/)
		.message("allow type : 'savings', 'blocked'")
		.required()
});
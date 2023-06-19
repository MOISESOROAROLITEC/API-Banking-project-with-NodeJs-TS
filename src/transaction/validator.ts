import Joi = require("joi");
import * as iban from "iban-ts";
import { ibanValidator } from "../common/validator";

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
	accountReciver: Joi.string(),
	accountPassword: Joi.string()
		.min(8)
		.max(50)
		.required(),
	amount: Joi.number()
		.min(1)
		.required(),
	transactionType: Joi.string(),
});

export const depositValidator = Joi.object({
	accountEmmiterIban: Joi.string(),
	accountReciver: Joi.string()
		.required(),
	amount: Joi.number()
		.min(1)
		.required(),
	transactionType: Joi.string()
});

export const transferValidator = Joi.object({
	accountEmmiterIban: Joi.string()
		.pattern(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]{0,15})?$/)
		.message("emmiter Iban is nont correct")
		.required(),
	accountReciver: Joi.string()
		.pattern(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]{0,15})?$/)
		.message("reciver Iban is nont correct")
		.required(),
	accountPassword: Joi.string()
		.min(8)
		.max(50)
		.required(),
	amount: Joi.number()
		.min(1)
		.required(),
	transactionType: Joi.string(),
});

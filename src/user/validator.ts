import Joi = require("joi");

export const createUserValidator = Joi.object({
	name: Joi.string()
		.min(3).message("name length must be longer than 2 characters")
		.max(30).message("name length can not be longer than 30 characters")
		.required(),

	email: Joi.string()
		.email()
		.required(),

	password: Joi.string()
		.min(7).message("password length must be longer than 7 characters")
		.max(50).message("password length can not be longer than 50 characters")
		.required(),
})

export const loginValidator = Joi.object({
	email: Joi.string()
		.email()
		.required(),

	password: Joi.string()
		.required(),
})

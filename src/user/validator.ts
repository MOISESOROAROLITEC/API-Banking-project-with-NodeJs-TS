import Joi = require("joi");

export const createUserValidator = Joi.object({
	name: Joi.string()
		.min(3).message("name length must be longer than 2 characters")
		.max(30).message("name length can not be longer than 30 characters")
		.required(),

	email: Joi.string()
		.email().message("Le format de l'adresse email est invalide")
		.required(),

	password: Joi.string()
		.min(7).message("password length must be longer than 7 characters")
		.max(50).message("password length can not be longer than 50 characters")
		.required(),

	role: Joi.string()
		.pattern(/^(user|admin)$/)
		.message("Les roles valide sont : 'user', 'admin'")
		.required()
		.default("user")
})

export const loginValidator = Joi.object({
	email: Joi.string()
		.email()
		.required(),

	password: Joi.string()
		.min(8).max(80)
		.required(),
})

export const updateUserValidator = Joi.object({
	userEmail: Joi.string()
		.email()
		.required(),
	name: Joi.string()
		.min(3).message("name length must be longer than 2 characters")
		.max(30).message("name length can not be longer than 30 characters"),
	email: Joi.string()
		.email(),
	password: Joi.string()
		.min(8).max(80)
})
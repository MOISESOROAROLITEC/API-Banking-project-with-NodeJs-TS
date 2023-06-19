const express = require('express')
import {
	getUserAccounts,
	login,
	removeUsers,
	update,
	userCreate,
	userList,
	verifyEmail
} from './controller'

const userRoutes = express.Router()

userRoutes.post('/user/create', userCreate);
userRoutes.post('/auth/login', login);
userRoutes.get('/users', userList);
userRoutes.get('/user/acounts', getUserAccounts);
userRoutes.delete('/users', removeUsers);
userRoutes.patch('/user/update', update);

export default userRoutes;

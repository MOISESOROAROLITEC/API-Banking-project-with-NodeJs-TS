const express = require('express')
import { verifyEmail } from '../shared/functions';
import {
	login,
	removeUsers,
	update,
	userCreate,
	userList,
	changePassword,
} from './controller'

const userRoutes = express.Router()

userRoutes.post('/user/create', userCreate);
userRoutes.post('/auth/login', login);
userRoutes.post('/user/reset-password/verify-email', verifyEmail);
userRoutes.post('/user/reset-password/new-password', changePassword);
userRoutes.get('/users', userList);
userRoutes.delete('/users', removeUsers);
userRoutes.patch('/user/update', update);

export default userRoutes;

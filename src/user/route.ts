const express = require('express')
import { login, update, userCreate, userList } from './controller'

const userRoutes = express.Router()

userRoutes.post('/user/create', userCreate);
userRoutes.post('/auth/login', login);
userRoutes.get('/user/list', userList);
userRoutes.patch('/user/update', update);

export default userRoutes;

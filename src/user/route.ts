const express = require('express')
import { login, userCreate, userList } from './controller'

const userRoutes = express.Router()

userRoutes.post('/user/create', userCreate);
userRoutes.post('/auth/login', login);
userRoutes.get('/user/list', userList);

export default userRoutes;

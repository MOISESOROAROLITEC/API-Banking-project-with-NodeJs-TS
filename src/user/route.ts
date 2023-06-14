const express = require('express')
import { login, removeUsers, update, userCreate, userList } from './controller'

const userRoutes = express.Router()

userRoutes.post('/user/create', userCreate);
userRoutes.post('/auth/login', login);
userRoutes.get('/users', userList);
userRoutes.delete('/users', removeUsers);
userRoutes.patch('/user/update', update);

export default userRoutes;

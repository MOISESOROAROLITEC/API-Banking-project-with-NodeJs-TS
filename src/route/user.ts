// const express = require('express');
const express = require('express')
import { body } from 'express-validator'
// import express from 'express'
import { login, userCreate, userList } from '../controller/user'

const userRoutes = express.Router()

userRoutes.post('/user/create', userCreate);
userRoutes.post('/auth/login', login);
userRoutes.get('/user/list', userList);

export default userRoutes;

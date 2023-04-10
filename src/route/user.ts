// const express = require('express');
import express from 'express'
import { adminCreate } from '../controller/user'

export const userRoutes = express.Router()

userRoutes.post('/user/create', adminCreate)

// module.exports = userRoutes
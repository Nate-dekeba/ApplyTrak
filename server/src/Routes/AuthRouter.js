import express from 'express'
import {registerUser} from '../Controllers/authController.js'
import { login } from '../login.js'


export const authRouter = express.Router()

authRouter.post('/register', registerUser);
authRouter.post('/login',login)


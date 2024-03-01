import {Router} from 'express'
import { changePassword, forgotPassword, getProfile, login, logout, register, resetPassword, updateUser } from '../controllers/user.Controller.js'
import { isloggedIn } from '../middleware/auth.middleware.js'
import upload from '../middleware/multure.middleware.js'


const router=Router()


router.post('/register',upload.single("avatar"),register)
router.post('/login',login)
router.get('/logout',logout)
router.get('/getProfile',isloggedIn,getProfile)
router.post('/reset',forgotPassword)
router.post('/reset/:resetToken',resetPassword)
router.post('/change-password',isloggedIn,changePassword)
router.put('/update/:id',isloggedIn,upload.single("avatar"),updateUser)

export default router
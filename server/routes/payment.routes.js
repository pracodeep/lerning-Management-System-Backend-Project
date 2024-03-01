import { Router } from 'express'
import { AllPayment, buySubscription, cancelSubscription, getRazorpayApiKey, verifySubscription } from '../controllers/payment.controller.js'
import { isloggedIn } from '../middleware/auth.middleware.js'
import { authorisedRoles } from '../middleware/auth.middleware.js'
const router= Router()

router.get('/razorpay-key',isloggedIn,getRazorpayApiKey)
router.post('/subscribe',isloggedIn,buySubscription)
router.post('/verify',isloggedIn,verifySubscription)
router.post('/unsubscribe',isloggedIn,cancelSubscription)

router.get('/',isloggedIn,authorisedRoles,AllPayment)


export default router

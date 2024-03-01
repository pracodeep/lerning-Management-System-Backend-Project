import User from "../models/user.models.js";
import {razorpay} from "../server.js";
import AppError from "../utils/error.util.js";


 export const getRazorpayApiKey=async(req,res,next)=>{

    req.status(200).json({
        success:true,
        message:'RazorPay Api Key',
        key: process.env.RAZORPAY_KEY_ID
    });

}

 export const buySubscription=async(req,res,next)=>{

    const {id}=req.user;
    const user =await User.findById(id);

    if(!user){
        return next (new AppError('Unauthrized please login',400))
    }

    if(user.role ==='ADMIN'){
        return next (new AppError('Admin can not purchased a subscription',400))


    }

    const subscription=await razorpay.subscriptions.create({
        plan_id:process.env.RAZORPAY_PLAN_ID,
        customer_notify
        })

        user.subscription.id=subscription.id;
        user.subscription.status=subscription.status
        await user.save()

        res.status(200).json({
            success:true,
            message:'subscribe successfully',
            subscription_id: subscription.id
        })





}

export const verifySubscription=async(req,res,next)=>{

    const {id}=req.user;
    const {razorpay_payment_id,razorpay_signature,razorpay_subscription_id }=req.body;

    const user=await User.findById(id);
    if(!user){
        return next (new AppError('unauthrized please og in'))

    }
    const subscriptionid=user.subscription.id;
    const generatedSingnature=crypto
    .createHmac('sha256',process.env.RAZORPAY_SECRET)
    .update(`${razorpay_payment_id}|${subscriptionid}`)
    .digest('hex')


    if(generatedSingnature!=razorpay_signature){
        return next (new AppError('Payment not verify please try again',500))

    }
await Payment.create({
    razorpay_payment_id,
    razorpay_signature,
    razorpay_subscription_id
});
user.subscription.status='active';
await user.save()
res.status(200).json({
    success:true,
    message:'payment verified successfully'
})
}

export const cancelSubscription=async(req,res,next)=>{

try {
    const {id}=req.user;
    const user=await User.findById(id)
    if(!user){
        return next (new AppError('unauthrized ,please log in'))
    }
    if(user.role==='ADMIN'){
        return next (new AppError('Admin can not purchase the subscription ',400))
    }

const subscriptionid=user.subscription.id;

const subscription=await razorpay.subscriptions.cancel(
    subscriptionid
)
user.subscription.status=subscription.status;
await user.save
    
} catch (error) {

    return next (new AppError(error.message))
    
}

   

}

export const AllPayment=async(req,res,next)=>{

    const {count}=req.query;

    const subscriptions=await razorpay.subscriptions.all({
      count: count ||10  
    })
    res.status(200).json({
        success:true,
        message:'All payments',
        subscriptions
        

    })
}

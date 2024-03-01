
import User from "../models/user.models.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary'
import upload from "../middleware/multure.middleware.js";
import fs from 'fs/promises';
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto'

const cookieOptions={        //7days
    maxAge:7*24*60*60*1000,
    
    
     
}

const register=async(req,res,next)=>{

    const {fullName,email,password}=req.body;

    if(!fullName|| !email || !password){
        return  next(new AppError('All field are required',400));
        
    }

    const userExists=await User.findOne({email});
    if(userExists){
    return  next(new AppError('Email already exists',400));

}

const user=await User.create({
    fullName,
    email,
    password,
    avatar:{
        public_id:email,
        secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
    }
})

if(!user){
     return  next(new AppError('user registration failed please try again',400));

}

//TODO:FILE UPLOAD

console.log("file detail",JSON.stringify(req.file))
if(req.file){
    
    try {
        const result=await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'project3',
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
        })
        if(result){
            user.avatar.public_id=result.public_id;
           // user.avatar.secure_url=result.secure_url;
        //remove file from server

        fs.rm(`uploads/${req.file.filename}`);


        
        
        }
        
    } catch (error) {
        return next(
            new AppError(error || 'file not uploaded please try again',500)
        )

        
    }
}

await user.save();
user.password=undefined;



const token=await user.generateJWTToken()

res.cookie('token',token,cookieOptions)

res.status(201).json({
    success:true,
    message:'user registerd successfully',
    user

})

}



const login= async (req,res,next)=>{

try {
    const {email,password}=req.body;

    if(!email || !password){

     return next(new AppError('All fields are required',400))
    }

    const user=await User.findOne({
        email
    }).select('+password');

    if(!user || !user.comparePassword(password)){
     return next (new AppError('email or password does not match',400))   
    }


    const token =await user.generateJWTToken()
    user.password=undefined;

    res.cookie('token',token,cookieOptions)

    res.status(200).json({
        success:true,
        message:'user logged in successfully',
        user
        

    })

} catch (error) {


    return next (new AppError(error.message,500))

    
}
}
   



const logout=(req,res)=>{


    res.cookie('token',null,{
      
      maxAge:0,
       
    });

    res.status(200).json({
        success:true,
        message:'User logedout successfully'
    })

}


const getProfile=async(req,res)=>{
    try {
        const userId=req.user.id;
        const user=await User.findById(userId)
        res.status(200).json({
            success:true,
            message:'User details',
            user
        })
    
        
    } catch (error) {
        return next (new AppError('failed to fetch profile detail',401))
    }

   
}

const forgotPassword=async(req,res,next)=>{

    const {email}=req.body;
    if(!email){
        return next(new AppError('email is required',400))


    }

    const user= await User.findOne({email})
    if(!user){
        return next(new AppError('email not registered',400))

    }
    const resetToken=await user.generatePasswordResetToken()

    await user.save()
    const resetPasswordURL=`${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    console.log(resetPasswordURL)
    const subject = 'Reset Password';
  const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

    try{
        await sendEmail(email,subject,message);
        res.status(200).json({
            success:true,
            message:`reset password token has been sent to ${email} successfully `

        })

    
    }catch(error){

        user.forgetPasswordExpiry=undefined;
        user.forgetPasswordToken=undefined;
        await user.save();

        return next (new AppError(error.message,500))
    }
}

const resetPassword=async(req,res)=>{

    const {resetToken}=req.params;

    const {password}=req.body;
    const forgetPasswordToken=crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

    const user=await User.findOne({
        forgetPasswordToken,
        forgetPasswordExpiry:{$gt:Date.now()}
    })
    if(!user){
        return next(new AppError('Token is ivalid or expire,please try again',400))
    }
    user.password=password;
    user.forgetPasswordToken=undefined
    user.forgetPasswordExpiry=undefined
    user.save();


    res.status(200).json({
        success:true,
        message:"password changed successfully"
    })

}

    const changePassword=async (req,res,next)=>{

        const {oldPassword,newPassword}=req.body;
        const {id}=req.user;


        if(!oldPassword || !newPassword){
            return next (new AppError("all field are maindatory",400))

        }

        
        const  user=await User.findById(id).select('+password')
        if(!user){
            return next (new AppError("user does not exist",400))
      

    }

    const isPasswordValid=await user.comparePassword(oldPassword);
    if(!isPasswordValid){
        return next (new AppError("invalid old password",400))


    }

    user.password=newPassword;

    user.password=undefined

    await user.save()

    res.status(200).json({
        success:true,
        message:"password change successfully"
});

}

const updateUser=async(req,res,next)=>{

    const {fullName}=req.body;
    const {id}=req.user.id;

    const user=await User.findById(id)
    if(!user){
        return next (new AppError('User does not exist',400))

    }

    if(req.fullName){
        user.fullName=fullName
    }

    
        await cloudinary.v2.uploader(user.avatar.public_id)
        if(req.file){
    
            try {
                const result=await cloudinary.v2.uploader.upload(req.file.path,{
                    folder:'lms',
                    width:250,
                    height:250,
                    gravity:'faces',
                    crop:'fill'
                })
                if(result){
                    user.avatar.public_id=result.public_id;
                   // user.avatar.secure_url=result.secure_url;
                //remove file from server
        
                fs.rm(`uploads ${req.file.filename}`)
        
        
                
                
                }
                
            } catch (error) {
                return next(
                    new AppError(error || 'file not uploaded please try again',500)
                )
        
                
            }
    }


    await user.save()
    res.status(200).json({
        success:true,
        message:'user updated successfully'

    })

}



export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser

}
import AppError from "../utils/error.util.js";
import jwt from'jsonwebtoken';


const isloggedIn=async (req,res,next)=>{
    const {token} = req.cookies


    if(!token){
        return next(new AppError('unauthenticated ,please login again',401))
    }

    const userDetail=await jwt.verify(token,process.env.JWT_SECRET)
    req.user=userDetail

next();

}

const authorisedRoles=(...roles)=> async(req,res,next)=>{
    
    const currentUserRoles=req.user.role;
    if(!roles.includes(currentUserRoles)){
        return next (new AppError('do not have permission to access this routes',403))

    }
    next()
}

export  {
    isloggedIn,
    authorisedRoles
}




import { Schema,model } from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'



const userSchema=new Schema({

    fullName:{
        type:'String',
        required:[true,'Name is required'],
        minLength:[5,'name is must be greater then 5 charecter'],
        maxLength:[50,'name must be less then 50 charecter'],
        lowercase:true,
        trim:true

    },
    email:{
        type:'string',
        required:[true,'email is required'],
        lowercase:true,
        trim:true,
        unique:true,
        match:[/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    'please fill in a valid email address']


    },
    password:{
        type:'String',
        required:[true,'Password is required'],
        minLength:[8,'Password must be at least 8 charecter'],
        select:false

},
avatar:{
    public_id:{
        type:'String'
    },
    secure_url:{
        type:'String'
    }

},
role:{
    type:'String',
    enum:['USER','ADMIN'],
    default:'USER'


},
forgetPasswordToken:String,
forgetPasswordExpiry:Date,
Subscription:{
    id:String,
    status:String


}


},{
    timestamps:true
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password=await bcrypt.hash(this.password,10)
    return next();


});

userSchema.methods={
    generateJWTToken:  async function(){
        return await jwt.sign(
            {
                id:this._id,email:this.email,Subscription:this.Subscription,role:this.role
                
            },
            process.env.JWT_SECRET,
            {
                    expiresIn:process.env.JWT_EXPIRY
            }


            
        )
    },
    comparePassword: async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword,this.password)

    },
    generatePasswordResetToken: async function ()  {
        const resetToken=crypto.randomBytes(20).toString('hex');
        this.forgetPasswordToken=crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
        ;
        this.forgetPasswordExpiry=Date.now() + 500 * 60 *1000;//15 minutes from now
            return resetToken;



    }
}


const User=model('User',userSchema);


export default  User


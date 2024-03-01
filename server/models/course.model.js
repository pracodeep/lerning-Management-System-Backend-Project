
import {model,Schema} from "mongoose"

const courseSchema=new Schema({
    title:{
        type:String,
        required:[true,'This item is required'],
        minLength:[8,'Title must be atleast 8 charecter'],
        maxLength:[60,'Title should be less then 60 charecter'],
        trim:true

    },
    description:{
        type:String,
        required:[true,'Description is required'],
        minLength:[8,'Discription must be atleast 8 charecter'],
        maxLength:[200,'Description should be less then 200 charecter'],
        trim:true
    },
    category:{
        type:String,
        required:[true,'category is required']

    },

    thumbnail:{
        public_id:{
            type:String,
            required:true
        },
        secure_url:{
            type:String,
            required:true

        }

    },
    lectures:[
        {
            title:String,
            description:String,
            lectures:{
                public_id:{
                    type:String,
                    required:true
                },
                secure_url:{
                    type:String,
                    required:true
                }
            }

        }
    ],
    numbersOfLuctures:{
        type:Number,
        default:0,
    },
    createdBy:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

const Course=model('Course',courseSchema)
export default Course
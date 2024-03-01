
import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
import upload from "../middleware/multure.middleware.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'




    const getAllCourses=async(req,res,next)=>{
        try{
      const course=await Course.find({}).select('-lectures')
        res.status(200).json({
            success:true,
            message:"All courese",
            course
        });
    
} catch (error) {
    return next (new AppError('error.message',400))
    
}
    }




const getLectureByCourseId=async(req,res,next)=>{

    try {
        const {id}=req.params;
        const course=await Course.findById(id)

        console.log(course)
        if(!course){
            return next (new AppError('invalid course id',500))
        }
        res.status(200).json({
            success:true,
            message:"course lecture fetched successfully",
            lectures:course.lectures
            
        })

        
    } catch (error) {
        return next (new AppError('error.message',400))
        
    }

}

const createCourse=async (req,res,next)=>{

const {title,description,category,createdBy}=req.body;
 if(!title||!description ||!category ||!createdBy){
    return next (new AppError('All field are required',400))

 }
 const course=await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail:{
        public_id:'Dummy',
        secure_url:'Dummy'
    }
 })

 if(!course){
    return next (new AppError('course could not be created',400))

 }



    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            });
            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }
    
            fs.rm(`uploads/${req.file.filename}`);
        } catch (error) {
            return next(new AppError(error.message, 500));
        }
    }
   
 await course.save()

 res.status(200).json({
    success:true,
    message:'course created successfully',
    course
 })
}

const updateCourse=async (req,res,next)=>{

    try {
        const {id}=req.params;
        const course=await Course.findByIdAndUpdate(
            id,{

                $set:req.body
            },
            {
                runValidators:true

            }


        );
        if(!course){
            return next (new AppError('Course with geven id does not exist',500))
        }
        res.status(200).json({
            success:true,
            message:'course updated successfully',
            course
        })
        
    } catch (error) {
        return next (new AppError(error.message,500))
        
    }

    
    

}

const removeCourse=async(req,res)=>{

    try {
        const {id}=req.params
        const course=await Course.findById(id)

        if(!course){
            return next (new AppError('course with given id does not exist',500))

        }
        await Course.findByIdAndDelete(id)
        res.status(200).json({
            success:true,
            message:'course deleted successfully'
        })
        
    } catch (error) {
        return next (new AppError(error.message,500))
    }

}

const addLectureByCourseId=async (req,res,next)=>{

    try {
        const {title,description}=req.body;
        const {id}=req.params;
        if(!title||!description){
            return next (new AppError('All field are required',400))
        
        }


        const course=await Course.findById(id)
        if(!course){
            return next (new AppError('course not found with this id',400))

        }

        const  lectureData={
            title,
            description,
            lectures:{}

        };
        if(req.file){
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms'
                });
                if (result) {
                    lectureData.lectures.public_id = result.public_id;
                    lectureData.lectures.secure_url = result.secure_url;
                }
        
                fs.rm(`uploads/${req.file.filename}`);
            } catch (error) {
                return next(new AppError(error.message, 500));
            }

        }

        course.lectures.push(lectureData)
        course.numbersOfLuctures=course.lectures.length

        await course.save()
        res.status(200).json({
            success:true,
            message:';ecture successfully added to the course',
            course
        })
        



        
    } catch (error) {

        return next (new AppError(error.message,400))
        
    }
    

     
        
    } 
    




export {
    getAllCourses,
    getLectureByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureByCourseId
    
}
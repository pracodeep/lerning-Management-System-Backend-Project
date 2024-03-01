import { strict } from 'assert';
import mongoose from 'mongoose'

mongoose.set('strictQuery',false)


const connectionToDB=async ()=>{
    try {
        const {connection}=await mongoose.connect(
            process.env.MONGO_URI
            )
            if(connection){
                console.log(`connecte to db ${connection.host}`);
            }
    

        
    }catch (error) {
    console.log(error)
    process.exit(1)        
    }

}

export default connectionToDB;
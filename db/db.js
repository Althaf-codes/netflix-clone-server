const mongoose = require('mongoose');


const connectDB=async ()=>{
try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI)

    console.log(`MongoDB connected at : ${connectionInstance.connection.host}`);
    
} catch (error) {
    console.log(`Mongo connection Error : ${error}`);
}

}

module.exports = connectDB;

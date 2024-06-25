const { ApiError } = require('../utils/api_error.js');
const { asynchandler } = require('../utils/async_handler.js');
const jwt =  require('jsonwebtoken');
const Admin = require('../model/admin_model.js');


 const verifyJwt = asynchandler(async(req,_,next)=>{
    try {

        const token = req.header("Authorization")?.replace("Bearer ","")

        console.log(`the header is ${req.header['Authorization']}`);
        console.log(`The bearer token is ${token}`);

        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)


        const admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken")

        if(!admin){
            throw new ApiError(401,"Invalid Access Token")
        }

        req.admin = admin
        next()
        
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})


 const restrictToAdmin=(roles=[])=>{

return asynchandler(async(req,res,next)=>{
    try {

        const token = req.header("Authorization")?.replace("Bearer ","")

        console.log(`the header is ${req.header['Authorization']}`);
        console.log(`The bearer token is ${token}`);

        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)


        const admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken")

        
        if(!admin){
            throw new ApiError(401,"Invalid Access Token")
        }

        if(!roles.includes(admin.role)){
            throw new ApiError(401, "Unauthorized Request")
        }
        
        req.admin = admin
        next()
        
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})


    // if(!req.admin) {
    //     throw new ApiError(401,"Unauthorized Request")
    // }

    // if(!roles.includes(req.admin.role)){
    //     throw new ApiError(401, "Unauthorized Request")
    // }

    // return next();


}

module.exports = {verifyJwt,restrictToAdmin}
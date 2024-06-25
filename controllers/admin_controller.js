const jwt =  require('jsonwebtoken');
const mongoose = require('mongoose')

const admin  =require('../model/admin_model.js');
const { asynchandler } = require('../utils/async_handler.js');
const { ApiError } = require('../utils/api_error.js');
const Admin = require('../model/admin_model.js');
const { ApiResponse } = require('../utils/api_response');

const Video = require('../model/video_model.js');
const { putObject } = require('../utils/helper.js');


const generateAccessAndRefreshToken= async (adminid)=>{
    try {
        const admin = await Admin.findById(adminid);
        console.log(`The admin is ${admin}`);

        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken

        console.log(`The access and refresh token is ${accessToken} and ${refreshToken}`);

        await admin.save({validateBeforeSave:true})

        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating referesh and access token ")
    }
}


const registerAdmin = asynchandler(async(req,res)=>{
    const {username,email,password,role} = req.body

    

    if ([username,email,password,role].some((field)=> field?.trim()=="")){

        throw new ApiError(400,"All fields are required ");
    }

    const exisitngAdmin = await Admin.findOne({
        email
    })

    if(exisitngAdmin){
        throw new ApiError(409,"Admin already exists")
    }

    const newAdmin = await Admin.create({
        username,
        email,
        role,
        password
    })


    const createdAdmin = await Admin.findById(newAdmin._id).select(
        "-password -refreshToken"
    )
    if(!createdAdmin){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(new ApiResponse(200,createdAdmin,'Admin created successfully'))

})


const loginAdmin = asynchandler(async(req,res)=>{

    const {email,password} = req.body


    if(!email && !password){
        throw new ApiError(400,"email and password are mandatory");
    }

    const exisitngAdmin = await Admin.findOne({email})

    if(!exisitngAdmin){
        throw new ApiError(404,"Admin does not exist");
    }

    const isPasswordValid = await exisitngAdmin.isPasswordCorrect(password);
    
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }

    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(exisitngAdmin._id);

    const loggedInAdmin = await Admin.findById(admin._id).select('-password -refreshToken')

    return res.status(200).json(new ApiResponse(200,{admin:loggedInAdmin,accessToken,refreshToken},"Admin Logged In Successfully"))


})

 const logOutAdmin = asynchandler(async(req,res)=>{
    await Admin.findByIdAndUpdate(req.admin.id,{
        $unset:{
            refreshToken:1
        }
    },{
        new:true
    }
)

return res.status(200).json(new ApiResponse(200,{},"Admin Logged Out Successfully "))
})


const refreshAccessToken = asynchandler(async(req,res)=>{
    const incomingRefreshToken =  req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const admin = await Admin.findById(decodedToken?._id)
        
        if(!admin){
            throw new ApiError(401,"Invalid Refresh Token. Please Login Again")
        }

        if(incomingRefreshToken!=admin?.refreshToken){

            throw new ApiError(401,"Refresh Token is Expired")
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(admin._id)
    
        return res
        .status(200)  
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )


    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


const uploadVideoMetaData = asynchandler(async(req,res)=>{
    try {
        console.log("its coming");

        const {title,description,genre,videoType,trailerUrl,language,isTrailerLaunched,duration,rating,views,cast,thumbnail,director,producer,status,isTop10,hasNewEpisodes} = req.body;

        console.log(`the data is ${title}, ${description}, ${genre}`);
    
            // if ([title,description,trailerUrl,videoType,language,isTrailerLaunched,duration,rating,views,cast,thumbnail,director,producer].some((field)=> field?.trim()=="")){
    
            //     throw new ApiError(400,"Mandatory fields are required ");
            // }
            if(!title || !description|| !trailerUrl || !videoType || !language || !isTrailerLaunched || !duration || !rating || !views || !cast || !thumbnail || !director ||!producer|| !status || !isTop10 || !hasNewEpisodes){
                throw new ApiError(400,"Mandatory fields are required ");
            }

            console.log(`The admin id is ${req.admin._id}`);

            const video = await Video.create({
                title,
                description,
                genre,
                videoType,
                trailerUrl,
                language,
                isTrailerLaunched,
                duration,
                rating,
                views,
                cast,
                thumbnail,
                director,
                producer,
                status,
                isTop10,
                hasNewEpisodes,
                // relatedVideos,
                "addedBy": req.admin._id
            })
    
            console.log(`The video id is ${video._id}`);

            res.status(200).json(new ApiResponse(200,video,"Video MetaData uploaded Successful"))
        
    } catch (error) {
        res.status(400).json( new ApiResponse(400,{error:error},"Error Occurred"))
    }

})


//make endpoint to update release date and ispublished to true

const updateVideoData = asynchandler(async(req,res)=>{
    try {

        const videoId = req.params.id;



        
    } catch (error) {
        res.status(400).json( new ApiResponse(400,{error:error},"Error Occurred"))
        
    }
})


// make update video metadata where in frontend get all the data and show it in the ui. if its get updated then change only that value in model and 
// rest of the data as same and $set all the value in backed endpoint


const getSignedUrlForVideo = asynchandler(async(req,res)=>{
    try {
        const videoId = req.params.id;
        const {filename,contentType} = req.body;

        if(!filename || !contentType){
            throw new ApiError(400,"All fields are mandatory")
        }

        const video = await Video.findById(videoId);
  
        if(!video){
            throw new ApiError(401,"Video Doesn't exist")
        }

        const newFilename = filename+"-".concat(videoId)

        const url = await putObject(newFilename,contentType)

        return res.status(200).json(new ApiResponse(200,{singedUrl:url},"Url retrieved successfully"))


    } catch (error) {
    return res.status(400).json(new ApiResponse(400,{error},"Error Occurred"))
        
    }
})


const uploadVideoUrl = asynchandler(async(req,res)=>{

  try {
      const {videoId,videoUrl} = req.params.id;
      if(!videoId){
          throw new ApiError(400,"All fields are required")
      }
  
      const video = await Video.findById(videoId);
  
      if(!video){
          throw new ApiError(401,"Video Doesn't exist")
      }
  
      await Video.updateOne({_id:video._id},{
          $set:{
              url:videoUrl,
              isPublished:true
          }
      })
  
      return res.status(200).json(new ApiResponse(200,{},"Url updated successfully"))
  } catch (error) {
    return res.status(400).json(new ApiResponse(400,{error},"Error Occurred"))
    
  }

})


module.exports= {
    registerAdmin,
    loginAdmin,
    logOutAdmin,
    refreshAccessToken,
    uploadVideoMetaData,
    uploadVideoUrl,
    getSignedUrlForVideo
    
}
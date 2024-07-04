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

        const {title,
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
            relatedVideos} = req.body;

        console.log(`the data is ${title}, ${description}, ${genre}`);
    
            // if ([title,description,trailerUrl,videoType,language,isTrailerLaunched,duration,rating,views,cast,thumbnail,director,producer].some((field)=> field?.trim()=="")){
    
            //     throw new ApiError(400,"Mandatory fields are required ");
            // }
            // if(!title ||
            //       !description ||
            //        !genre ||
            //         !trailerUrl ||
            //          !videoType ||
            //           !language ||
            //            !isTrailerLaunched ||
            //              !isTop10 ||
            //               !relatedVideos ||
            //                !hasNewEpisodes||
            //                 !duration ||
            //                  !rating ||
            //                   !views ||
            //                    !cast ||
            //                     !thumbnail ||
            //                      !director ||
            //                       !producer||
            //                        !status ){
            //     throw new ApiError(400,"Mandatory fields are required ");
            // }

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
                relatedVideos,
                "addedBy": req.admin._id
            })

            // not added fields are isPublished, url, releaseDate, seasons
    
            console.log(`The video id is ${video._id}`);

            res.status(200).json(new ApiResponse(200,video,"Video MetaData uploaded Successful"))
        
    } catch (error) {
        res.status(400).json( new ApiResponse(400,{error:error.message},"Error Occurred"))
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
      const {videoId,videoUrl} = req.body;
      if(!videoId){
          throw new ApiError(400,"All fields are required")
      }
  
      const video = await Video.findById(videoId);
  
      if(!video){
          throw new ApiError(401,"Video Doesn't exist")
      }
  
      const updatedVideo  = await Video.updateOne({_id:video._id},{
          $set:{
              url:videoUrl,
              status:"UPLOADED"
          }
      })

      if(!updatedVideo){
        throw ApiError(404,"Video not found");
      }

      return res.status(200).json(new ApiResponse(200,{data:updatedVideo},"Url updated successfully"))
  } catch (error) {
    return res.status(400).json(new ApiResponse(400,{error:error.message},"Error Occurred"))
    
  }

});


const addSeason = asynchandler(async(req,res)=>{
    try {
        const {seriesId,seasonId,trailerUrl} = req.body;

        const series = await Video.findById(seriesId);

        if(!series){
            throw ApiError(401,"Video not found")
        }


        const updatedSeries = await Video.findOneAndUpdate(
            {
            "_id":seriesId,  
            "seasons.season":{$ne:seasonId}
            },
            {
            $push:{
                seasons:{
                    season:seasonId,
                    trailerUrl:trailerUrl
                }
            }
        },{new:true,upsert:true})

        return res.status(200).json(new ApiResponse(200,{data:updatedSeries},"Season Added"))

    } catch (error) {
        console.log(`THE ERROR IS ${error}`);
    return res.status(400).json(new ApiResponse(400,{error:error.message},"Error Occurred"))
        
    }

});


const addEpisode = asynchandler(async(req,res)=>{
    try {
        const {seriesId,seasonId,episodeId,episodeNumber} = req.body;

        const series = await Video.findById(seriesId);
        
        if(!series){
            throw ApiError(404,"Series not found")
        }
       

        // const video = await Video.findOneAndUpdate({
        //     '_id':seriesId,
        //     'seasons.season':seasonId,
        //     'seasons.episodes.episodeNumber':episodeNumber
        // },{
        //     $set:{
        //         'seasons.$[seasonElem].episodes.$[episodeElem].videoId':episodeId
        //     }

        // },
        // {
        //     arrayFilters:[{'seasonElem.season':parseInt(seasonId),'episodeElem.episodeNumber':parseInt(episodeNumber)}],
        //     new:true,
        //     upsert:true

        // })

        // if(video){
        //    return res.status(200).json(new ApiResponse(200,{data:video},"Video with episode number already Exist"));
        // }

        const updatedseries = await Video.findOneAndUpdate({
            '_id':seriesId,
            'seasons.season':seasonId,
        },{
            $push:{
                'seasons.$.episodes':{
                    'videoId':episodeId,
                    'episodeNumber':episodeNumber
                }
            }
        },
        {
            new:true
        }
    )

    if(!updatedseries){
        throw ApiError(404,"Video or season not found");
    }


        console.log(`The Updated Series is ${updatedseries}`);

        return res.status(200).json(new ApiResponse(200,{data:updatedseries},"Data updated successfully"))
        
    } catch (error) {
    return res.status(400).json(new ApiResponse(400,{error:error.message},"Error Occurred"))
        
    }

})

const deleteEpisode = asynchandler(async(req,res)=>{
    try {

        const {seriesId,seasonNumber,episodeNumber} = req.params;

        const deletedEpisode = await Video.findOneAndUpdate({
            '_id':seriesId,
            'seasons.season':seasonNumber
        },{
            $pull:{
                'seasons.$.episodes':{episodeNumber:parseInt(episodeNumber,10)}
            }
        },{
            new:true
        }
    )

        
        if(!deletedEpisode){
            throw ApiError(404,"Series or Season or Episode not found")
        }
       return res.status(200).json(new ApiResponse(200,{data:deletedEpisode},"Episode Deleted successfully"))
        
    } catch (error) {
        return res.status(400).json(new ApiResponse(error.statusCode,{error:error.messahe},"Error Occurred"));
    }
});


const updateEpisode = asynchandler(async(req,res)=>{
    try {
        const { seriesId, seasonNumber, episodeNumber } = req.params;
        const { newVideoId,newEpisodeId } = req.body; 

        const video = await Video.findOne({
            '_id':seriesId,
            'seasons.season':seasonNumber,
            // 'seasons.episodes.episodeNumber':episodeNumber

        },
        {
            $set:{
                'seasons.$[seasonElem].episodes.$[episodeElem].videoId':newVideoId,
                'seasons.$[seasonElem].episodes.$[episodeElem].episodeNumber':newEpisodeId,
            }
        },{
            arrayFilters:[
                {
                'seasonElem.season':parseInt(seasonNumber),
                'episodeElem.episodeNumber':parseInt(episodeNumber)
            }
            ],
            new:true,
            upsert:true
        }
    )


        if(!video){
            throw ApiError(404,"Series or Season or Episode not found")
        }
        
        return res.status(200).json(new ApiResponse(200,{data:video},"Video updated successfully"));
        
    } catch (error) {
        console.log(`The ERROR is ${error}`);
        return res.status(400).json(new ApiResponse(error.statusCode,{error:error.message},"Error Occurred"));
        
    }
})
const uploadreleaseDate = asynchandler(async(req,res)=>{
    try {
        const {videoId,releaseDate} = req.body;

        const video = await Video.findByIdAndUpdate({
            '_id':videoId,
        },{
            $set:{
                releaseDate:releaseDate
            }
        },{
            new:true
        })
        
        if(!video){
            throw ApiError(404,"Video not found");
        }

        return res.status(200).json(new ApiResponse(200,{data:video},"Release date updated successfully"));

    } catch (error) {
        console.log(`The ERROR is ${error}`);
        return res.status(400).json(new ApiResponse(error.statusCode,{error:error.message},"Error Occurred"));
        
    }
})
const releaseVideo = asynchandler(async(req,res)=>{
    try {
        const {videoId} = req.body;

        const video  = await Video.findOneAndUpdate({
            _id:videoId,
            isPublished:false,
            url:{$exists:true},
            releaseDate:{$exists:true}
        },{
            $set:{
                isPublished:true
            }
        },{
            new:true
        }
    )
    if(!video){
        throw ApiError(404,"video not found");
    }
    return res.status(200).json(new ApiResponse(200,{data:video},"Video released successfully"))
    } catch (error) {
        console.log(`The ERROR is ${error}`);
        return res.status(400).json(new ApiResponse(error.statusCode,{error:error.message},"Error Occurred"));
        
    }
})

// make a route to add relatedvideos based on it genre and release Date. 
module.exports= {
    registerAdmin,
    loginAdmin,
    logOutAdmin,
    refreshAccessToken,
    uploadVideoMetaData,
    uploadVideoUrl,
    getSignedUrlForVideo,
    addSeason,
    addEpisode,
    deleteEpisode,
    updateEpisode,    
    uploadreleaseDate,
    releaseVideo
}
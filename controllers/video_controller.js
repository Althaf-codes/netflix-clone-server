const Video = require('../model/video_model.js');
const User = require('../model/user_model.js');
const { ApiError } = require('../utils/api_error.js');
const { ApiResponse } = require('../utils/api_response.js');
const { asynchandler } = require('../utils/async_handler.js');

const relatedVideoAggregation = ()=>{
    return [
        {
            $lookup:{
                from:"videos",
                foreignField:"_id",
                localField:"relatedVideos",
                as:"relatedVideos",
                pipeline:[
                   {
                    $project:{
                        title:1,
                        description:1,
                        thumbnail:1,
                        rating:1,
                        views:1,
                        duration:1,
                        genre:1,
                        videoType:1

                        
                    }
                   }
                ]
            }
        }
     ]
}

// const allPosterAggregaton = ()=>{

  
// }

const getRecentVideos= asynchandler(async(req,res)=>{
    //it returns both movies and sereis

    try {
        const page = req.params.page

        if(!page){
            throw new ApiError(400,"page field is required")
        }
    
        const limit=10
        const skip = (page-1)*limit
    
        const videos = await Video.aggregate([
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    genre: 1,
                    videoType: 1,
                    hasNewEpisodes: 1,
                    isTop10: 1,
                    duration: 1,
                    rating: 1,
                    views: 1,
                    thumbnail: 1,
                    releaseDate: 1
                }
            },
            {
                $sort:{
                    releaseDate:-1
                }
            },
            {
                $skip:skip
            },
            {
                $limit:10
            }
        ]);
    
        if (!videos){
            throw new ApiError(404,"Video Doesn't exist")
        }

        return res.status(200).json(new ApiResponse(200,{data:videos},"Video retreived successfully"))

    } catch (error) {
        return res.status(401).json(new ApiResponse(400,{data:[]},error.message))
    }

})



const getTop10Videos=asynchandler(async(req,res)=>{
    //it returns both movies and sereis

    try {
        const top10videos = await Video.find({isTop10:true}).select("title description genre videoType hasNewEpisodes isTop10 duration rating views thumbnail");

        if (!top10videos){
            throw new ApiError(404,"Video Doesn't exist")
        }
        return res.status(200).json(new ApiResponse(200,{data:top10videos},"Video retreived successfully"))

    } catch (error) {
        return res.status(401).json(new ApiResponse(400,{data:[]},error.message))
        
    }
})

const getMovieByGenre = asynchandler(async(req,res)=>{
    //it returns both movies and sereis
    
    try {
        let genres =  req.query.genres?req.query.genres.split(','):[]
       

    console.log(`the genres are ${genres}`);
    const page = parseInt(req.query.page) || 1;

    console.log(`the page is ${page}`);
    
        if(!page){
            throw new ApiError(400,"page field is required")
        }
    
        const limit=10
        const skip = (page-1)*limit
        if(!genres){
            throw new ApiError(400,"Genre field is required")
        }
        const videos = await Video.find({genre:{$in:[...genres]}}).select("title description genre videoType hasNewEpisodes isTop10 duration rating views thumbnail").skip(skip).limit(limit);

        if(!videos||videos.length==0){

            throw new ApiError(404,"Video Not Found ")
        }

        return res.status(200).json(new ApiResponse(200,{data:videos},"Video retreived successfully"))
        
    } catch (error) {
        return res.status(401).json(new ApiResponse(400,{data:[]},error.message))
        
    }
})

const getSeriesVideos = asynchandler(async(req,res)=>{
    const page = req.params.page

    try {
        if(!page){
            throw new ApiError(400,"page field is required")
        }
    
        const limit=10
        const skip = (page-1)*limit

    const seriesVideos = await Video.find({ videoType: 'Series' }).select('title description genre videoType hasNewEpisodes isTop10 duration rating views thumbnail').skip(skip).limit(limit);

    console.log(seriesVideos);
    if(!seriesVideos || seriesVideos.length==0){
        throw new ApiError(404,"Video Doesn't exist ")
    }

    return res.status(200).json(new ApiResponse(200,{data:seriesVideos},"Video retreived successfully"))

} catch (error) {
    return res.status(401).json(new ApiResponse(400,{data:[]},error.message))
    
}
})


//continue-watching

const getInProgressVideos = asynchandler(async(req,res)=>{
   try {
        const {userId} = req.params;
        if(!userId){
            throw new ApiError(401,"UserId field is required")
        }

         const watchedVideos = await User.aggregate([
             {
                 $match: { _id: mongoose.Types.ObjectId(userId) }
             },
             {
                 $unwind: '$watchHistory'
             },
             {
                 $match: { 'watchHistory.progress': { $gt: 0, $lt: 100 } }
             },
             {
                 $lookup: {
                     from: 'videos', // collection name in MongoDB
                     localField: 'watchHistory.videoId',
                     foreignField: '_id',
                     as: 'videoDetails'
                 }
             },
             {
                 $unwind: '$videoDetails'
             },
             {
                 $project: {
                     _id: '$videoDetails._id',
                     title: '$videoDetails.title',
                     description: '$videoDetails.description',
                     genre: '$videoDetails.genre',
                     videoType: '$videoDetails.videoType',
                     hasNewEpisodes: '$videoDetails.hasNewEpisodes',
                     isTop10: '$videoDetails.isTop10',
                     duration: '$videoDetails.duration',
                     rating: '$videoDetails.rating',
                     views: '$videoDetails.views',
                     thumbnail: '$videoDetails.thumbnail',
                     progress: '$watchHistory.progress',
                     watchedAt: '$watchHistory.watchedAt'
                 }
             },
             {
                 $sort: { watchedAt: -1 }
             }
         ]);

         if(!watchedVideos){
            throw new ApiError(404,"Video not found")
         }

    return res.status(200).json(new ApiResponse(200,{data:watchedVideos},"Video retreived successfully"))
    
     
   } catch (error) {
    return res.status(401).json(new ApiResponse(400,{data:[]},error.message))
    
   }
})
   
   //trending-videos

   module.exports ={
    getInProgressVideos,
    getMovieByGenre,
    getRecentVideos,
    getSeriesVideos,
    getTop10Videos
   }

const Video = require('../model/video_model.js');
const User = require('../model/user_model.js');
const { ApiError } = require('../utils/api_error.js');
const { ApiResponse } = require('../utils/api_response.js');
const { asynchandler } = require('../utils/async_handler.js');
const mongoose = require('mongoose');
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

const posterPipeline = {
    $project : {
        title:1,
        description:1 ,
        genre:1,
        videoType:1,
        hasNewEpisodes:1,
        isTop10:1,
        duration:1,
        rating:1,
        views:1,
        thumbnail:1
    }
};

const getRecentVideos= asynchandler(async(req,res)=>{
    //it returns both movies and sereis

    try {
        // console.log("its here");
        // const page = parseInt(req.query.page) || 1;
        const page= parseInt(req.query.page) ?? 1; 
        console.log(`The page is ${page}`);
        console.log(`page is ${page} `);

        if(!page){
            throw new ApiError(400,"page field is required")
        }
    
        const limit=10
        const skip = (page-1)*limit
    
        const videos = await Video.aggregate([
            {$match:
                {
                    isPublished:true,
                    videoType:{$in:['Movie','Series']}
                }},
            
                posterPipeline,
                // $ project: {
                //     _id: 1,
                //     title: 1,
                //     description: 1,
                //     genre: 1,
                //     videoType: 1,
                //     hasNewEpisodes: 1,
                //     isTop10: 1,
                //     duration: 1,
                //     rating: 1,
                //     views: 1,
                //     thumbnail: 1,
                //     releaseDate: 1
                // }
            
            {
                $sort:{
                    "releaseDate":-1
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
        const top10videos = await Video.find({isTop10:true, "isPublished":true}).select("title description genre videoType hasNewEpisodes isTop10 duration rating views thumbnail");

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
        let genres =  req.query.genres //?req.query.genres.split(',') : []
       

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
        const videos = await Video.find({genre:{$in:[...genres]}, "isPublished":true}).select("title description genre videoType hasNewEpisodes isTop10 duration rating views thumbnail").skip(skip).limit(limit);

        if(!videos||videos.length==0){
            throw new ApiError(404,"Video Not Found ")
        }

        return res.status(200).json(new ApiResponse(200,{data:videos},"Video retreived successfully"))
        
    } catch (error) {
        console.log(`The ERROR is ${error}`);
        return res.status(401).json(new ApiResponse(error.statusCode,{data:[]},error.message))
        
    }
})

const getSeriesVideos = asynchandler(async(req,res)=>{
    const page = req.query.page || 1;

    try {
        if(!page){
            throw new ApiError(400,"page field is required")
        }
    
        const limit=10
        const skip = (page-1)*limit

    const seriesVideos = await Video.find({ videoType: 'Series',isPublished:true }).select('title description genre videoType hasNewEpisodes isTop10 duration rating views thumbnail').skip(skip).limit(limit);

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
        const userId = req.params.userId;
        if(!userId){
            throw new ApiError(401,"UserId field is required")
        }

         const watchedVideos = await User.aggregate([
             {
                 $match: {
                     _id:new mongoose.Types.ObjectId(userId),
                    
                }
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
                     as: 'videoDetails',
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
   

const getVideoById = asynchandler(async(req,res)=>{
    try {
        const {videoId }= req.params;
        // const videoDetails = await Video.aggregate([
        //     { $match: {
        //                  _id:new mongoose.Types.ObjectId(videoId)
        //     //     $ and:[
        //     //         {
        //     //         },
        //     //         {
        //     //         isPublished:true
        //     //         }
        //     // ]
        //     }},
        //     {
        //         $lookup: {
        //             from: 'videos',
        //             localField: 'relatedVideos',
        //             foreignField: '_id',
        //             as: 'relatedVideos'
        //         }
        //     },
        //     {
        //         $unwind: {
        //             path: '$seasons',
        //             preserveNullAndEmptyArrays: true
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'videos',
        //             localField: 'seasons.episodes.videoId',
        //             foreignField: '_id',
        //             as: 'episodesDetails'
        //         }
        //     },
        //     {
        //         $addFields: {
        //             'seasons.episodes': {
        //                 $map: {
        //                     input: '$seasons.episodes',
        //                     as: 'episode',
        //                     in: {
        //                         $mergeObjects: [
        //                             '$$episode',
        //                             {
        //                                 $arrayElemAt: [
        //                                     '$episodesDetails',
        //                                     { $indexOfArray: ['$episodesDetails._id', '$$episode.videoId'] }
        //                                 ]
        //                             }
        //                         ]
        //                     }
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: '$_id',
        //             title: { $first: '$title' },
        //             description: { $first: '$description' },
        //             genre: { $first: '$genre' },
        //             videoType: { $first: '$videoType' },
        //             seasons: { $push: '$seasons' },
        //             trailerUrl: { $first: '$trailerUrl' },
        //             language: { $first: '$language' },
        //             isTrailerLaunched: { $first: '$isTrailerLaunched' },
        //             isTop10: { $first: '$isTop10' },
        //             hasNewEpisodes: { $first: '$hasNewEpisodes' },
        //             isPublished: { $first: '$isPublished' },
        //             status: { $first: '$status' },
        //             releaseDate: { $first: '$releaseDate' },
        //             duration: { $first: '$duration' },
        //             rating: { $first: '$rating' },
        //             views: { $first: '$views' },
        //             url: { $first: '$url' },
        //             thumbnail: { $first: '$thumbnail' },
        //             cast: { $first: '$cast' },
        //             director: { $first: '$director' },
        //             producer: { $first: '$producer' },
        //             relatedVideos: { $first: { $slice: ['$relatedVideos', 10] } }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             title: 1,
        //             description: 1,
        //             genre: 1,
        //             videoType: 1,
        //             seasons: 1,
        //             trailerUrl: 1,
        //             language: 1,
        //             isTrailerLaunched: 1,
        //             isTop10: 1,
        //             hasNewEpisodes: 1,
        //             isPublished: 1,
        //             status: 1,
        //             releaseDate: 1,
        //             duration: 1,
        //             rating: 1,
        //             views: 1,
        //             url: 1,
        //             thumbnail: 1,
        //             cast: 1,
        //             director: 1,
        //             producer: 1,
        //             'relatedVideos._id': 1,
        //             'relatedVideos.title': 1,
        //             'relatedVideos.description': 1,
        //             'relatedVideos.genre': 1,
        //             'relatedVideos.videoType': 1,
        //             'relatedVideos.hasNewEpisodes': 1,
        //             'relatedVideos.isTop10': 1,
        //             'relatedVideos.duration': 1,
        //             'relatedVideos.rating': 1,
        //             'relatedVideos.views': 1,
        //             'relatedVideos.thumbnail': 1
        //         }
        //     }
        // ]);
  
       const video = await Video.findById({_id:videoId});
       if(video.videoType=='Movie'){
        const videoDetails = await Video.find({_id:videoId}).populate('relatedVideos','title description genre videoType hasNewEpisodes isTop10 duration ratingviews thumbnail');

        return res.status(200).json(new ApiResponse(200,{data:videoDetails},"Video Retrieved Successfully"))
       }

        const videoDetails = await Video.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(videoId) , isPublished:true} },
            {
                $lookup: {
                    from: 'videos',
                    localField: 'relatedVideos',
                    foreignField: '_id',
                    as: 'relatedVideos',
                    pipeline:[posterPipeline]
                }
            },
            {
                $lookup: {
                    from: 'videos',
                    localField: 'seasons.episodes.videoId',
                    foreignField: '_id',
                    as: 'episodesDetails',
                    pipeline:[ posterPipeline]
                    // [
                        // {
                        //     $ project : {
                        //         title:1,
                        //         description:1 ,
                        //         genre:1,
                        //         videoType:1,
                        //         hasNewEpisodes:1,
                        //         isTop10:1,
                        //         duration:1,
                        //         rating:1,
                        //         views:1,
                        //         thumbnail:1
                        //     }
                        // }
                        // ]
                }
            },
            {
                $addFields: {
                    seasons: {
                        $map: {
                            input: '$seasons',
                            as: 'season',
                            in: {
                                season: '$$season.season',
                                trailerUrl: '$$season.trailerUrl',
                                episodes: {
                                    $map: {
                                        input: '$$season.episodes',
                                        as: 'episode',
                                        in: {
                                            $mergeObjects: [
                                                '$$episode',
                                                {
                                                    $arrayElemAt: [
                                                        '$episodesDetails',
                                                        { $indexOfArray: ['$episodesDetails._id', '$$episode.videoId'] }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    genre: 1,
                    videoType: 1,
                    trailerUrl: 1,
                    language: 1,
                    isTrailerLaunched: 1,
                    isTop10: 1,
                    hasNewEpisodes: 1,
                    isPublished: 1,
                    status: 1,
                    releaseDate: 1,
                    duration: 1,
                    rating: 1,
                    views: 1,
                    url: 1,
                    thumbnail: 1,
                    cast: 1,
                    director: 1,
                    producer: 1,
                    relatedVideos: { $slice: ['$relatedVideos', 10] },
                    seasons: {
                        $cond: {
                            if: { $gt: [{ $size: '$seasons' }, 0] },
                            then: '$seasons',
                            else: []
                        }
                    }
                }
            }
        ]);

        console.log(`The video is ${videoDetails}`);

        if(!videoDetails){
            throw ApiError(404,"Series or season or episode not found")
        }

        return res.status(200).json(new ApiResponse(200,{data:videoDetails},"Data retrived successfully"));
   } catch (error) {
    return res.status(400).json(new ApiResponse(error.statusCode,{error:error.message},"Error Occurred"));
    
}
})

   //trending-videos

   module.exports ={
    getInProgressVideos,
    getMovieByGenre,
    getRecentVideos,
    getSeriesVideos,
    getTop10Videos,
    getVideoById
   }

const User = require('../model/user_model.js');
const { ApiError } = require('../utils/api_error.js');
const { ApiResponse } = require('../utils/api_response');
const { asynchandler } = require('../utils/async_handler.js');


const createUser = asynchandler(async(req,res)=>{
    const{username,email,uid,preferences} = req.body;

    console.log(`The data are ${username},${email},${preferences}, ${uid}`);
    try {
        const user = await User.findOne({"email":email,"uid":uid})
        if(!user){
            const newuser = User({
                username,
                email,
                uid,
                preferences
            })

            await newuser.save();

            console.log(`The user is ${newuser}`);
            return res.status(200).json(new ApiResponse(200,{data:newuser},"User signed Up successfully "))

        }else{
            // const loggesInUser = await User.findOne({"email":email,"uid":uid});

            // if(!loggesInUser){
            //     throw ApiError(401,"Unauthorized User")
            // }

            return res.status(200).json(new ApiResponse(200,{data:loggesInUser},"User signed in successfully "))

        }
    } catch (error) {
        console.log(`The ERRROR ${error}`);
        return res.status(401).json(new ApiResponse(401),{error:error},"Error Occurred")
    }
})

const getUser = asynchandler(async(req,res)=>{
    
    try {
        const {email,uid}= req.params;
        const user = await User.findOne({"email":email,"uid":uid});

        console.log(`The email uid are ${email}, ${uid}`);

        // const page = req.query.page

        // if(!page){
        //     throw new ApiError(400,"page field is required")
        // }
    
        // const limit=10
        // const skip = (page-1)*limit

        // const userAggregationPipeline =
        //     [
        //         {$match:{"uid":uid,"email":email}},
        //         {
        //             $lookup:{
        //                 from:'videos',
        //                 let:{watchHistory:'$watchHistory'},
        //                 as:"watchHistoryDetails",
        //                 pipeline:[
        //                     {
        //                         $match:{$expr:{$in:['$_id','$$watchHistory.videoId']}},
        
        //                     },
        
        //                     {
        //                         $project:{
        //                             _id: 1,
        //                             title: 1,
        //                             description: 1,
        //                             genre: 1,
        //                             videoType: 1,
        //                             hasNewEpisodes: 1,
        //                             isTop10: 1,
        //                             duration: 1,
        //                             rating: 1,
        //                             views: 1,
        //                             thumbnail: 1,
        //                             watchedAt:{
        //                                 $arrayElemAt:['$$watchHistory.watchedAt',{ $indexofArray :['$$watchHistory.videoId','$_id']}]
        //                             },
        //                             progress:{
        //                                 $arrayElemAt:['$$watchHistory.progress',{$indexofArray:['$$watchHistory.videoId','$_id']}]
        //                             }
        //                         }
        //                     }
        //                 ]
        //             },
        
        //         },
        //         {
        //             $lookup:{
        //                 from:'videos',
        //                 localField:'favorites',
        //                 foreignField:'_id',
        //                 as:'favoritesDetails',
        //                 pipeline:[
        //                     {
        //                         $project:{
        //                             _id: 1,
        //                             title: 1,
        //                             description: 1,
        //                             genre: 1,
        //                             videoType: 1,
        //                             hasNewEpisodes: 1,
        //                             isTop10: 1,
        //                             duration: 1,
        //                             rating: 1,
        //                             views: 1,
        //                             thumbnail: 1
        //                         }
        //                     },
        //                     {$skip:skip},
        //                     {$limit:limit}
        //                 ]
        //             }
        //         },
        //         {
        //             $lookup:{
        //                 from:'videos',
        //                 localField:'watchlist',
        //                 foreignField:'_id',
        //                 as:'watchlistDetails',
        //                 pipeline:[
        //                    {
        //                     $project:{
        //                         _id: 1,
        //                         title: 1,
        //                         description: 1,
        //                         genre: 1,
        //                         videoType: 1,
        //                         hasNewEpisodes: 1,
        //                         isTop10: 1,
        //                         duration: 1,
        //                         rating: 1,
        //                         views: 1,
        //                         thumbnail: 1
                                
        //                     }
        //                    },
        //                    {$skip:skip},
        //                    {$limit:limit}
        //                 ]
        //             },
        
        //         },
        //         {
        //             $project: {
        //               username: 1,
        //               email: 1,
        //               uid: 1,
        //               subscription: 1,
        //               preferences: 1,
        //               watchHistory: { $slice: ['$watchHistoryDetails', skip, limit] },
        //               favorites: 1,
        //               watchlist: 1
        //             }
        //         }
               
        //     ];
        


        
        // const pipeline = [
        //   { $match: { "uid": uid,"email":email } }, // Match the specific user by their ID
        //   { $unwind: '$watchHistory' }, // Flatten the watchHistory array
        //   {
        //     $lookup: {
        //       from: 'videos',
        //       localField: 'watchHistory.videoId',
        //       foreignField: '_id',
        //       as: 'watchHistoryDetails'
        //     }
        //   },
        //   { $unwind: '$watchHistoryDetails' },
        //   {
        //     $project: {
        //       username: 1,
        //       email: 1,
        //       uid: 1,
        //       subscription: 1,
        //       preferences: 1,
        //       'watchHistoryDetails._id': 1,
        //       'watchHistoryDetails.title': 1,
        //       'watchHistoryDetails.description': 1,
        //       'watchHistoryDetails.genre': 1,
        //       'watchHistoryDetails.videoType': 1,
        //       'watchHistoryDetails.hasNewEpisodes': 1,
        //       'watchHistoryDetails.isTop10': 1,
        //       'watchHistoryDetails.duration': 1,
        //       'watchHistoryDetails.rating': 1,
        //       'watchHistoryDetails.views': 1,
        //       'watchHistoryDetails.thumbnail': 1,
        //       'watchHistory.watchedAt': 1,
        //       'watchHistory.progress': 1
        //     }
        //   },
        //   {
        //     $group: {
        //       _id: '$_id',
        //       username: { $first: '$username' },
        //       email: { $first: '$email' },
        //       uid: { $first: '$uid' },
        //       subscription: { $first: '$subscription' },
        //       preferences: { $first: '$preferences' },
        //       watchHistory: {
        //         $push: {
        //           poster: '$watchHistoryDetails',
        //           watchedAt: '$watchHistory.watchedAt',
        //           progress: '$watchHistory.progress'
        //         }
        //       },
        //       favorites: { $first: '$favorites' },
        //       watchlist: { $first: '$watchlist' }
        //     }
        //   },
        //   {
        //     $lookup: {
        //       from: 'videos',
        //       localField: 'favorites',
        //       foreignField: '_id',
        //       as: 'favoritesDetails',
        //       pipeline: [
        //         { $skip: skip },
        //         { $limit: limit }
        //       ]
        //     }
        //   },
        //   {
        //     $lookup: {
        //       from: 'videos',
        //       localField: 'watchlist',
        //       foreignField: '_id',
        //       as: 'watchlistDetails',
        //       pipeline: [
        //         { $skip: skip },
        //         { $limit: limit }
        //       ]
        //     }
        //   },
        //   {
        //     $project: {
        //       username: 1,
        //       email: 1,
        //       uid: 1,
        //       subscription: 1,
        //       preferences: 1,
        //       watchHistory: { $slice: ['$watchHistory', skip, limit] }, // Apply pagination to watchHistory
        //       favorites: '$favoritesDetails', // Apply pagination to favorites in  $ lookup
        //       watchlist: '$watchlistDetails'  // Apply pagination to watchlist in $ lookup
        //     }
        //   }
        // ];
        



        // const user = await User.aggregate(pipeline).exec();
        console.log(`The user is ${user}`);
        if(!user){
            throw ApiError(401,"Invalid credentials")
        }

    //     const user = await User.findOne({"email":email,"uid":uid})
    //     .populate({
    //       path: 'watchHistory.videoId favorites watchlist',
    //       select: '_id title description genre videoType hasNewEpisodes isTop10 duration rating views thumbnail',
    //       options: { limit, skip }
    //     });
  
    //   if (!user) {
    //     return res.status(404).json({ error: 'User not found' });
    //   }
  
    //   const watchHistory = user.watchHistory.map(history => ({
    //     poster: {
    //       id: history.videoId._id,
    //       title: history.videoId.title,
    //       description: history.videoId.description,
    //       genre: history.videoId.genre,
    //       videoType: history.videoId.videoType,
    //       hasNewEpisodes: history.videoId.hasNewEpisodes,
    //       isTop10: history.videoId.isTop10,
    //       duration: history.videoId.duration,
    //       rating: history.videoId.rating,
    //       views: history.videoId.views,
    //       thumbnail: history.videoId.thumbnail
    //     },
    //     watchedAt: history.watchedAt,
    //     progress: history.progress
    //   }));
  
    //   const favorites = user.favorites.map(fav => ({
    //     poster: {
    //       id: fav._id,
    //       title: fav.title,
    //       description: fav.description,
    //       genre: fav.genre,
    //       videoType: fav.videoType,
    //       hasNewEpisodes: fav.hasNewEpisodes,
    //       isTop10: fav.isTop10,
    //       duration: fav.duration,
    //       rating: fav.rating,
    //       views: fav.views,
    //       thumbnail: fav.thumbnail
    //     }
    //   }));
  
    //   const watchlist = user.watchlist.map(watch => ({
    //     poster: {
    //       id: watch._id,
    //       title: watch.title,
    //       description: watch.description,
    //       genre: watch.genre,
    //       videoType: watch.videoType,
    //       hasNewEpisodes: watch.hasNewEpisodes,
    //       isTop10: watch.isTop10,
    //       duration: watch.duration,
    //       rating: watch.rating,
    //       views: watch.views,
    //       thumbnail: watch.thumbnail
    //     }
    //   }));
  
    //   const response = {
    //     userdata: {
    //       ...user.userdata,
    //       watchHistory,
    //       favorites,
    //       watchlist
    //     }
    //   };
  


        return res.status(200).json(new ApiResponse(200,{"data":user},"User fetched successfully"));
   
} catch (error) {
        console.log(`The ERRROR ${error}`);

        return res.status(401).json(new ApiResponse(401),{error:error},"Error Occurred")
        
    }
})



const updateWatchHistory = asynchandler(async(req,res)=>{

    try {
        const {email,uid,videoId,progress}= req.body;

        const user = await User.findOne({"email":email,"uid":uid});

        console.log(`The email uid are ${email}, ${uid}`);
        console.log(`Its here in updateWatchHistory`);

        if(!user){
            throw ApiError(401,"Unauthorized Request")
        }
        const isvideoExist  =  await User.findOne({"_id":user._id,"watchHistory.videoId":videoId});

        // if(isvideoExist){
        //     return res.status(200).json(new ApiResponse(200,{data:isvideoExist},"Data uploaded successfully"))
        // }
        // console.log(isvideoExist);
    
        if (isvideoExist){
            console.log("The video Exist is ",`${isvideoExist}`);
            const updatedUser = await User.findOneAndUpdate(
                {
                  "_id": user._id,
                  'watchHistory.videoId': videoId
                },
                {
                  $set: {
                    'watchHistory.$.progress': progress,
                    'watchHistory.$.watchedAt': new Date()
                  }
                },
                {
                  new: true
                }
              );
        
              return res.status(200).json(new ApiResponse(200,{data:updatedUser},"Data updated successfully"))
        
        }else{
            console.log("The video dosen't Exist ");

            const updatedUser = await User.findOneAndUpdate(
                {
                "_id":user._id,
                "watchHistory.videoId":{$ne:videoId}
            },
            {
            $push:{
                watchHistory:{
                    videoId:videoId,
                    progress:progress,
                    watchedAt:new Date()
                }
            },
            },{new:true,upsert:true}
        )
        return res.status(200).json(new ApiResponse(200,{data:updatedUser},"Data uploaded successfully"))

        }



       
    
   
   
        
    } catch (error) {
        console.log(`The ERROR is ${error}`);
    }
})


module.exports={
    createUser,
    getUser,
    updateWatchHistory
}
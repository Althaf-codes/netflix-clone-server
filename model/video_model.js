const {mongoose,Schema} = require('mongoose');



const sesaonSchema = Schema({
    season:{
        type:Number,
    },
    trailerUrl:{
        type:String
    },
    episodes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Video'
        }
    ]
})

const videoScehma = new  Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: [{ type: String, required: true }],
    videoType:{type:String, enum:['Movie','Series', 'Episode']},
    seasons:[sesaonSchema],
    trailerUrl:{type:String},
    language: { type: String, required: true },
    isTrailerLaunched:{type:Boolean,default:false},
    isTop10:{type:Boolean,default:false},
    hasNewEpisodes:{type:Boolean,default:false},
    isPublished:{type:Boolean,default:false},
    status:{type:String,enum:["PENDING","RECEIVED","UPLOADED","FAILED"]}, //to check if video is uploaded or not
    releaseDate: { type: Date, },
    duration: { type: Number, required: true }, // in minutes
    rating: { type: Number, min: 0, max: 10 },
    views: { type: Number, default: 0 },
    url: { type: String, },
    thumbnail: { type: String, required: true },
    cast: [{ type: String }],
    director: { type: String },
    producer: { type: String },
    relatedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
},{timestamps:true})

const Video = mongoose.model('Video',videoScehma);

module.exports = Video;
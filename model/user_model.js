const {mongoose, Schema} = require('mongoose');

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uid:{type:String, required:true},
    subscription: {
        plan: { type: String, enum: ['basic', 'standard', 'premium'], default: 'basic' },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date }
    },
    watchHistory: [{
        videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
        watchedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 }
    }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    preferences: {
        genres: [{ type: String }],
        languages: [{ type: String }]
    },
},{timestamps:true})    


const User = mongoose.model('User',userSchema);

module.exports= User;


// const now = new Date();
// const next30Days = now.getTime() + 30 * 24 * 60 * 60 * 1000;
// const next30DaysTimestamp = new Date(next30Days).getTime();


// const next30DaysDate = new Date(next30Days);
// const formattedDate = next30DaysDate.toLocaleDateString('en-US');
// console.log(formattedDate); // e.g. "3/22/2023"






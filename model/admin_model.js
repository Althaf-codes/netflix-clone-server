const {mongoose,Schema} = require('mongoose');
const bcrypt = require('bcrypt');
const jwt= require('jsonwebtoken');

const adminSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'moderator', 'contentManager'], default: 'contentManager' },
    refreshToken:{type:String}
    // lastLogin: { type: Date },
    // activityLog: [{
    //     action: { type: String },
    //     timestamp: { type: Date, default: Date.now },
    //     details: { type: String }
    // }],
},{timestamps:true}) 



adminSchema.pre("save",async function(next){
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);
    console.log(`this password is ${this.password}`);
    console.log('It came here in pre hooks');
    
    next()

})

adminSchema.methods.isPasswordCorrect = async function(password){
    console.log(`${password} and ${this.password}` );
    return await bcrypt.compare(password,this.password)
}


adminSchema.methods.generateAccessToken = function(){
    // console.log("its in gen accesstoken");
    // console.log(`this values are ${this._id} , ${this.username}, ${this.email}`);
return jwt.sign({
    _id:this._id,
    username:this.username,
    email:this.email,
    role:this.role
    },process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
    // console.log(`the tok is ${token}`);
    // return token
}

adminSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,
        },process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        })
    }


const Admin = mongoose.model("Admin",adminSchema);

module.exports = Admin;






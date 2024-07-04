const express = require('express');

const app = express();
const dotenv = require('dotenv');

const cors = require('cors');
const connectDB = require('./db/db');


dotenv.config({})

const PORT = process.env.PORT||8000 

const { verifyJwt} = require('./middlewares/admin_middleware.js');

const adminRoute = require('./routes/admin_routes.js');
const videoRoute = require('./routes/video_routes.js');
const userRoute =  require('./routes/user_routes.js');

const corsoptions = cors({
    origin:'*'
});

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(corsoptions);

connectDB();


// const now = new Date();
// const next30Days = now.getTime() + 30 * 24 * 60 * 60 * 1000;
// const next30DaysTimestamp = new Date(next30Days).getTime();


// const next30DaysDate = new Date(next30Days);
// const formattedDate = next30DaysDate.toLocaleDateString('en-US');
// console.log(formattedDate); // e.g. "3/22/2023"


// console.log(`next30DaysTimestamp is ${next30DaysTimestamp}`);
// console.log(`next30DaysDate is ${next30DaysDate}`);
// console.log(`formattedDate is ${formattedDate   }`);

app.use("/admin",adminRoute);
app.use("/videos",videoRoute);
app.use("/user",userRoute);

// app.use("/video")


app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}`);
})


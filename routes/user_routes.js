const express = require('express');

const router = express.Router();
const  {createUser,getUser,updateWatchHistory}= require('../controllers/user_controller.js');

router.post('/create-user',createUser);

router.get('/get-user/:email/:uid',getUser);


router.post('/update-watchHistory',updateWatchHistory);

router.post('/update-watchlist',)

router.post('/add-favourites')


module.exports = router;
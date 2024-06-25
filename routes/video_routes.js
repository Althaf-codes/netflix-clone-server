const express = require('express');
const { verifyJwt } = require('../middlewares/admin_middleware.js');
const {uploadVideoMetaData} = require('../controllers/admin_controller.js')
const router = express.Router();
const {getRecentVideos,getInProgressVideos,getSeriesVideos,getMovieByGenre,getTop10Videos} = require('../controllers/video_controller.js');

// router.post('/create-video',verifyJwt,uploadVideoMetaData)

router.get('/recent/:page',getRecentVideos);
router.get('/top10-videos',getTop10Videos);
router.get('/continue-watching/:userId',getInProgressVideos);
router.get('/series/:page',getSeriesVideos);
router.get('/getByGenre/',getMovieByGenre);

router.get('/trending-videos');

 
router.get('/getvideo/:id')

router.post('/update-url')

router.post('/update-trailerUrl')

router.put('/update-views')

router.put('/update-rating')


module.exports = router
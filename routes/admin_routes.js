const express = require('express');
const {loginAdmin,logOutAdmin,refreshAccessToken,registerAdmin,uploadVideoMetaData,uploadVideoUrl, getSignedUrlForVideo,addSeason,addEpisode,deleteEpisode,updateEpisode,releaseVideo,uploadreleaseDate}= require('../controllers/admin_controller.js');

const {restrictToAdmin, verifyJwt} = require('../middlewares/admin_middleware.js');
const router = express.Router();



router.post('/signup',[restrictToAdmin(["superadmin"])],registerAdmin);
// router.post('/signup',registerAdmin)


router.post('/login',loginAdmin);


router.post('/logout',verifyJwt,logOutAdmin);

router.post('/refresh-token',refreshAccessToken);

router.post('/create-video',verifyJwt,uploadVideoMetaData);
router.post('/upload-video-url/',verifyJwt, uploadVideoUrl);

router.post('/get-signed-url/:id',verifyJwt,getSignedUrlForVideo);
router.post('/add-season',verifyJwt,addSeason);
router.post('/add-episode',verifyJwt,addEpisode);
router.delete('/delete-episode/series/:seriesId/seasons/:seasonNumber/episodes/:episodeNumber',verifyJwt,deleteEpisode);
router.put('/update-episode/series/:seriesId/seasons/:seasonNumber/episodes/:episodeNumber',verifyJwt,updateEpisode)


router.put('/release-video',verifyJwt,releaseVideo);
router.post('/upload-release-date',verifyJwt,uploadreleaseDate);

// router.put('/release-video',[restrictToAdmin(["superadmin"])],releaseVideo);
// router.put('/update-release-date',[restrictToAdmin(["superadmin"])],uploadreleaseDate);

router.get('/get-alladmin')

router.get('/analytics/:id')

// router.get('/analytics/:id')

module.exports = router




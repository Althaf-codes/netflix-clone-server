const express = require('express');
const {loginAdmin,logOutAdmin,refreshAccessToken,registerAdmin,uploadVideoMetaData,uploadVideoUrl, getSignedUrlForVideo}= require('../controllers/admin_controller.js');

const {restrictToAdmin, verifyJwt} = require('../middlewares/admin_middleware.js');
const router = express.Router();



router.post('/signup',[restrictToAdmin(["superadmin"])],registerAdmin)
// router.post('/signup',registerAdmin)


router.post('/login',loginAdmin)


router.post('/logout',verifyJwt,logOutAdmin)

router.post('/refresh-token',refreshAccessToken)

router.post('/create-video',verifyJwt,uploadVideoMetaData)
router.post('/upload-video-url/:id',verifyJwt, uploadVideoUrl)

router.post('/get-signed-url/:id',verifyJwt,getSignedUrlForVideo)


router.get('/get-alladmin')

router.get('/analytics/:id')

// router.get('/analytics/:id')

module.exports = router




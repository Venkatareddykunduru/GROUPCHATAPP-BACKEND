const express=require('express');
const router=express.Router();
const messagecontroller=require('../controllers/message');
const authenticate=require('../middleware/authenticate');
const upload=require('../util/s3service');

router.post('/sendmessage',authenticate,messagecontroller.sendmessage);
router.get('/getmessages',authenticate,messagecontroller.getmessages);
router.post('/uploadfile',authenticate,upload.array('files'),messagecontroller.uploadfile);
module.exports=router;
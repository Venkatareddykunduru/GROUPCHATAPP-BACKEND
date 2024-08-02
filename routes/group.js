const express=require('express');
const router=express.Router();
const groupcontroller=require('../controllers/group');
const authenticate=require('../middleware/authenticate');

router.post('/creategroup',authenticate,groupcontroller.creategroup);
router.post('/addusertogroup',authenticate,groupcontroller.addusertogroup);
router.post('/makeadmin',authenticate,groupcontroller.makeadmin);
router.post('/removeuserfromgroup',authenticate,groupcontroller.removeuserfromgroup);
router.get('/getgroups',authenticate,groupcontroller.getgroups);
router.get('/getusers',authenticate,groupcontroller.getusers);

module.exports=router;
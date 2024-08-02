const User = require("../models/user");
const UserGroup = require("../models/usergroup");
const Group=require("../models/group");


// Create a group
exports.creategroup = async (req, res) => {
  const { name } = req.body;
  
  try {
      const group=await req.user.createGroup({ name }, {
          through: {
              isadmin: 'yes'
          }
      });
      res.status(201).json({ message: 'Group created successfully',group:group });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a user to a group
exports.addusertogroup = async (req, res) => {
  const { groupId, userId } = req.body;

  const groupid = parseInt(groupId, 10);
  const userid = parseInt(userId, 10);

  // Check if groupid and userid are valid numbers
  if (isNaN(groupid) || isNaN(userid)) {
      return res.status(400).json({ message: 'Invalid groupId or userId' });
  }

  try {
      const usr=await User.findByPk(userId);
      if(!usr){
        return res.status(404).json({message:`${userId} not found in database`});
      }
      const userGroup = await UserGroup.findOne({ where: { groupId: groupid, userId: req.user.id } });
      if (!userGroup) {
          return res.status(404).json({ message: 'User who sent request not found in the group' });
      }
      if (userGroup.isadmin === 'no') {
          return res.status(403).json({ message: 'You are not an admin' });
      }
      await UserGroup.create({ userId: userid, groupId: groupid, isadmin: 'no' });
      res.status(201).json({ message: 'User added to group' });
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
};

// Make a user admin of a group
exports.makeadmin = async (req, res) => {
  const { groupId, userId, newStatus } = req.body;

  const groupid = parseInt(groupId, 10);
  const userid = parseInt(userId, 10);

  // Check if groupid and userid are valid numbers
  if (isNaN(groupid) || isNaN(userid)) {
      return res.status(400).json({ error: 'Invalid groupId or userId' });
  }

  try {
      const userGroup = await UserGroup.findOne({ where: { groupId: groupid, userId: req.user.id } });
      if (!userGroup) {
          return res.status(404).json({ error: 'User who sent the request not found in the group' });
      }
      if (userGroup.isadmin === 'no') {
          return res.status(403).json({ message: 'You are not an admin' });
      }

      const makeuseradmin = await UserGroup.findOne({ where: { groupId: groupid, userId: userid } });
      if (!makeuseradmin) {
          return res.status(404).json({ error: 'User whom you want to make admin not found in the group' });
      }

      makeuseradmin.isadmin = newStatus;
      await makeuseradmin.save();
      res.status(200).json({ message: 'User admin status changed' });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove a user from a group
exports.removeuserfromgroup = async (req, res) => {
  const { groupId, userId } = req.body;

  const groupid = parseInt(groupId, 10);
  const userid = parseInt(userId, 10);

  // Check if groupid and userid are valid numbers
  if (isNaN(groupid) || isNaN(userid)) {
      return res.status(400).json({ message: 'Invalid groupId or userId' });
  }

  try {
      const userGroup = await UserGroup.findOne({ where: { groupId: groupid, userId: req.user.id } });
      if (!userGroup) {
          return res.status(404).json({ message: 'User who sent the request not found in the group' });
      }
      if (userGroup.isadmin === 'no') {
          return res.status(403).json({ message: 'You are not an admin' });
      }
      const usergroupremove = await UserGroup.findOne({ where: { groupId: groupid, userId: userid } });
      if (!usergroupremove) {
          return res.status(404).json({ message: 'User whom you want to remove not found in the group' });
      }

      await usergroupremove.destroy();
      res.status(200).json({ message: 'User removed from the group' });
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
};

// Get groups for a user
exports.getgroups = async (req, res) => {
  try {
      const groups = await req.user.getGroups();
      res.status(200).json({ groups: groups });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getusers= async (req,res) => {
    const {groupId}=req.query;
    const groupid=parseInt(groupId,10);

    if (isNaN(groupid)) {
        return res.status(400).json({ error: 'Invalid groupId' });
    }

    try{
        const group=await Group.findByPk(groupid);
        //console.log(group);
        const users = await group.getUsers({
            attributes: ['id', 'name'], // Attributes from the User model
        });
        //console.log(users);
        let curuserstatus="no";
        users.forEach((user)=>{
            if(user.id==req.user.id){
                curuserstatus=user.usergroup.isadmin;
            }
        });
        res.status(200).json({users:users,curuserstatus});
    } catch (error) {
        res.status(500).json({errr:'Internal server error'});
    }
}
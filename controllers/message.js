const Message=require('../models/message');
const UserGroup=require('../models/usergroup');
const { Op } = require('sequelize'); // Import Sequelize operators
// Send a message to a group
exports.sendmessage = async (req, res) => {
  const { groupId, content } = req.body;

  // Check if groupId and content are provided
  if (!groupId || !content) {
      return res.status(400).json({ error: 'GroupId and content are required' });
  }

  const groupid = parseInt(groupId, 10);

  // Check if groupid is a valid number
  if (isNaN(groupid)) {
      return res.status(400).json({ error: 'Invalid groupId' });
  }

  try {
      const message = await Message.create({ groupId: groupid, userId: req.user.id, content });
      res.status(201).json({ res: `Message added successfully to group ${groupid}`, message: message });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
};

// Get messages from a group
exports.getmessages = async (req, res) => {
  const { groupId, id } = req.query;

  const messageId = parseInt(id, 10);
  const groupid = parseInt(groupId, 10);

  // Check if groupid and messageId are valid numbers
  if (isNaN(groupid) || isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid groupId or messageId' });
  }

  // Check if user is in the group
  const userGroup = await UserGroup.findOne({ where: { groupId: groupid, userId: req.user.id } });
  if (!userGroup) {
      return res.status(404).json({ error: 'User who sent the request not found in the group' });
  }

  try {
      let messages;
      if (messageId === -1) {
          // Fetch the latest 5 messages
          messages = await Message.findAll({
              where: { groupId: groupid },
              limit: 7, // Fetch the latest 5 messages
              order: [['createdAt', 'DESC']] // Order by creation date, newest first
          });
          messages=messages.reverse();
      } else {
          // Fetch messages after the specified message ID
          messages = await Message.findAll({
              where: {
                  groupId: groupid,
                  id: { [Op.gt]: messageId },
              },
              order: [['createdAt', 'ASC']], // Order by creation date, newest first
          });
      }

      res.status(200).json({
          messages: messages
      });
  } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

exports.uploadfile=(req,res)=>{
    try{
        console.log('received request');
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        console.log(req.files);
        const urls = req.files.map(file => {
            const filename=file.originalname;
            const urllink=file.location;
            return {filename,urllink};

        });
        console.log(urls);
        res.json({ urls: urls });
    }catch (error) {
        console.log('error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    
}
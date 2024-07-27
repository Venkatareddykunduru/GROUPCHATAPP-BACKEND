const bcrypt = require('bcrypt');
const User= require('../models/user'); // Adjust the path according to your project structure

exports.createuser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await User.create({ name, email, phone, password: hashedPassword });

    // Respond with the created user's information
    console.log('User created successfully');
    res.status(201).json({
      message: 'User created successfully!'
    });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({
      message: 'Error creating user',
      error: error.errors ? error.errors[0].message : error.message
    });
  }
};

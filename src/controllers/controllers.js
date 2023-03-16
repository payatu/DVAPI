const User = require('../models/user');
const path = require('path');

const dummyusers = [
  { username: 'Alice', password: 'AlicePassword1@44', score: 100 },
  { username: 'Bob', password: 'BobtheBuild3r512!', score: 200 },
  { username: 'Charlie', password: 'CharlieCharlie11333377', score: 300 }
];

// Add dummy users to the database
async function addDummyUsers() {
  for (const user of dummyusers) {
    const existinguser = await User.findOne({ username: user.username });
    if (!existinguser) {
      await new User(user).save();
    }
  }
}
addDummyUsers()


exports.getHome = (req, res, next) => {
    res.render('index', {});
    };

exports.get404 = (req, res, next) => {
    res.render('404', {});
    };

exports.verify = (req, res, next) => {
    res.json({ message: 'Authentication successful' });
}

exports.getProfile = (req, res, next) => {
  async function getUserDetails(userId) {
    try {
      console.log('userId:', userId);
      const user = await User.findOne({ _id: userId });
      if(!user){
        return res.json({ message: 'User does not exist' });
      }
      return res.json({ status: "success", user: {
        id: user._id,
        username: user.username,
        score: user.score,
      } });
    } catch (error) { // handle error
      console.log('Error finding user:', error);
      return res.json({ status: "error", message: 'Error finding user' });
    }
  }
  getUserDetails(req.userId);
  
}

exports.addNote = (req, res, next) => {
    const { note } = req.body;
    if (!note) {
        return res.status(400).json({ status: "error", message: 'Note is required' });
    }
    async function updateUserSecretNote(userId) {
        try {
          const updatedUser = await User.findOneAndUpdate(  // Update the user's secret note
            { _id: userId },
            { secretNote: note },
            { new: true }
          );
          console.log('User updated:', updatedUser);
          return res.json({ status: "success", message: 'Successfully added a note' });
        } catch (error) { // handle error
          console.log('Error updating user:', error);
          res.json({ status: "error", message: 'Failed to add note' });
        }
      }
      updateUserSecretNote(req.userId);
};

exports.getNote = (req, res, next) => {
    async function getUserSecretNote() {
        try {
          const user = await User.findOne({ username: req.query.username });
          console.log('User found:', user);
          if(!user.secretNote || user.secretNote == ""){
            return res.json({ status: "error", message: 'No note found' });
          }
          return res.json({ status: "success", note: user.secretNote });
        } catch (error) { // handle error
          console.log('Error finding user:', error);
          return res.json({ status: "error", message: 'Error finding user' });
        }
      }
      getUserSecretNote();
}

exports.updateProfile = (req, res, next) => {
  console.log(req.body);
  const { password, confirm_password } = req.body;
    if (!password || !confirm_password) { // check if password and confirm_password are provided
      return res.status(400).json({ status: "error", message: 'password and confirm_password required' });
    }
    if(password !== confirm_password){  // check if password and confirm_password match
      return res.status(400).json({ status: "error", message: 'password and confirm_password must match' });
    }
  async function updateUserDetails(userId) {
    try {
      console.log('userId:', userId);
      const updatedUser = await User.findOneAndUpdate(  // Update the user's password
        { _id: userId },
        { password: password },
        { new: true }
      );
      return res.json({ status: "success", message: "User has been successfully updated", user: {
        id: updatedUser._id,
        username: updatedUser.username,
      } });
    } catch (error) { // handle error
      console.log('Failed to update user:', error);
      return res.json({ status: "error", message: 'Failed to update user' });
    }
  }
  updateUserDetails(req.userId);
  
}

exports.getScores = (req, res, next) => {
  async function getUserScores() {
    try {
      // Find all users with status ACTIVE and return only the username and score in descending order
      const users = await User.find({ status: "ACTIVE" }, { _id: 0, username: 1, score: 1 }).sort({score: -1});
      // Return the username and score for each user
      return users.map(user => ({ username: user.username, score: user.score }));
    } catch (err) {
      console.error(err);
      // Return an empty array if there is an error
      return [];
    }
  }
  getUserScores().then(scores => {
    console.log(scores);
    res.json({ status: "success", scores: scores })
  }).catch(err => {
    console.error(err);
    res.json({ status: "error", message: 'Failed to get scores' });
  });
  
}

exports.updateUserStatus = (req, res, next) => {
  async function updateUserStatus() {
    const { username, status } = req.body;
    console.log(username, status)
    if (!username || !status) { // Check if username and status are provided
      return res.status(400).json({ status: "error", message: 'username and status required' });
    }
    try {
      if (status !== 'ACTIVE' && status !== 'BANNED') { // Check if status is valid
        return res.status(400).json({ status: "error", message: 'status must be ACTIVE or BANNED' });
      }
      const updatedUser = await User.findOneAndUpdate(  // Update the user status
        { username: username },
        { status: status },
        { new: false }
      );
      if(!updatedUser){ 
        return res.json({ status: "error", message: 'User does not exist' }); // show this message if user does not exist
      }
      if(updatedUser.status === status){
        return res.json({ status: "error", message: 'User status is already ' + status });  // show this message if user status is already the same
      }
      return res.json({ status: "success", message: "User status has been successfully updated to " + status });  // show this message if user status is updated
    }
    catch (err) {
      console.error(err);
      return res.json({ status: "error", message: 'Failed to update user status' });  // show this message if there is an error
    }
  }
  updateUserStatus(req.userId)
}

exports.uploadProfileImage = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    console.log(req.userId);
  
    const file = req.files.file;
    console.log(file)
    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExtension = path.extname(file.name).toLowerCase();
    console.log(fileExtension)
    if (!allowedExtensions.includes(fileExtension)) { // Check extension if file is an image
      return res.status(400).send('Invalid file type. Only PNG, JPG, and JPEG files are allowed.');
    }
    const uploadPath = path.join(__dirname, '../uploads', req.userId + file.name);
    console.log(uploadPath)
    const normalizedPath = path.normalize(uploadPath);
    console.log(normalizedPath)
    console.log(path.join(__dirname, 'uploads'))
    if (!normalizedPath.startsWith(path.join(__dirname, '../uploads'))) {
      return res.status(400).send('Invalid file path');
    }

  
    file.mv(uploadPath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
      async function updateUserProfilePic(userId) {
        try {
          const updatedUser = await User.findOneAndUpdate(  // Update the user's profile pic
            { _id: userId },
            { profilePic: req.userId + file.name },
            { new: true }
          );
          console.log(updatedUser)
          return res.status(200).json({ message: 'File uploaded successfully' });
        } catch (error) { // handle error
          console.log('Failed to update user:', error);
          return res.status(500).json({ message: 'Failed to update user profile pic' });
        }
      }
      updateUserProfilePic(req.userId);
    });
}
  
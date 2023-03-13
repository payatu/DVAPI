const User = require('../models/user'); // assuming you have a User model

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
          const updatedUser = await User.findOneAndUpdate(
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
  const addition = req.body.addition;
  if(addition){
    console.log("ADDITION: ", addition)
  }
  const { password, confirm_password } = req.body;
    if (!password || !confirm_password) {
      return res.status(400).json({ status: "error", message: 'password and confirm_password required' });
    }
    if(password !== confirm_password){
      return res.status(400).json({ status: "error", message: 'password and confirm_password must match' });
    }
  async function updateUserDetails(userId) {
    try {
      console.log('userId:', userId);
      const updatedUser = await User.findOneAndUpdate(
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
      const users = await User.find({}, { _id: 0, username: 1, score: 1 }).sort({score: -1});
      // Return the username and score for each user
      return users.map(user => ({ username: user.username, score: user.score }));
    } catch (err) {
      console.error(err);
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
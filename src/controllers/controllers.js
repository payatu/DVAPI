const User = require('../models/user');
const Challenge = require('../models/challenge')
const path = require('path');
const fs = require('fs');
const http = require('http');
const request = require('request');
const Ticket = require('../models/ticket');
const crypto = require('crypto');

function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length/2))
          .toString('hex')
          .slice(0,length);
}

const dummyusers = [
  { username: 'admin', password: generateRandomString(32), score: 0, status: 'ACTIVE', secretNote: 'flag{bola_15_ev3rywh3r3}'},
  { username: 'Alice', password: generateRandomString(32), score: 100, secretNote: 'I like pizza. Definitely gonna eat one!' },
  { username: 'Bob', password: generateRandomString(32), score: 200, secretNote: 'I must win this CTF!'},
  { username: 'Charlie', password: generateRandomString(32), score: 300, secretNote: 'What do I write here???' }
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
addDummyUsers();

const challenges = [
  { challengeNo: 1, flag: 'flag{bola_15_ev3rywh3r3}' },
  { challengeNo: 2, flag: 'flag{aBus1ng_w34K_s3cR3TTT}' },
  { challengeNo: 3, flag: 'flag{br0k3n_oBj3cT_Pr0p3rTy_L3v3L_Auth0RiS4Ti0N}' },
  { challengeNo: 4, flag: 'flag{file_size_is_important}' },
  { challengeNo: 5, flag: 'flag{n0_fUncTi0N_L3v3L_aUtH???}' },
  { challengeNo: 6, flag: 'flag{55RF_c4n_wR3AK_h4v0c}' },
  { challengeNo: 7, flag: 'flag{St4cK_tR4c3_eRR0R}' },
  { challengeNo: 8, flag: 'flag{n0_r4t3_L1m1T?}' },
  { challengeNo: 9, flag: 'flag{a553Ts_m4N4g3m3NT_g0n3_wR0ng}' },
  { challengeNo: 10, flag: 'flag{eZ_n0SQLi_pWn}' },
];

// Add flags to the database
async function addChallenges() {
  for (const challenge of challenges) {
    const challengeAdded = await Challenge.findOne({ challengeNo: challenge.challengeNo});
    if (!challengeAdded) {
      await new Challenge(challenge).save();
    }
  }
}
addChallenges();

exports.getHome = (req, res, next) => {
    return res.status(301).redirect('/challenges');
    };

exports.get404 = (req, res, next) => {
    res.render('404', {});
    };

exports.verify = (req, res, next) => {
    res.json({ status: 'success', message: 'Authentication successful', user: req.user });
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
        profilePic: user.profilePic
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
          return res.json({ status: "success", message: 'Successfully updated note' });
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
  const { current_password, password, confirm_password } = req.body;
    if (current_password != req.user.password){
      return res.status(401).json({ status: "error", message: 'Enter your current password correctly' });
    }
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
    if (req.user.score >= 10000) {
      return res.json({ status: "success", scores: scores , "flag":"flag{br0k3n_oBj3cT_Pr0p3rTy_L3v3L_Auth0RiS4Ti0N}"})
    }
    return res.json({ status: "success", scores: scores })
  }).catch(err => {
    console.error(err);
    res.json({ status: "error", message: 'Failed to get scores' });
  });
  
}

exports.updateUserStatus = (req, res, next) => { // TODO
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
      return res.json({ status: "success", message: "User status has been successfully updated to " + status, flag: "flag{n0_fUncTi0N_L3v3L_aUtH???}" });  // show this message if user status is updated
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
    const file = req.files.file;
    console.log(file)
    // ADD FILE SIZE CHECK HERE
    const fileSize = (file.size/1024).toFixed(2);
    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) { // Check extension if file is an image
      return res.status(400).send('Invalid file type. Only PNG, JPG, and JPEG files are allowed.');
    }
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      // Create directory if it doesn't exist
      fs.mkdirSync(uploadDir);
      console.log(`Created directory: ${uploadDir}`);
    }
    const uploadPath = path.join(__dirname, '../uploads', req.userId + fileExtension);
    const normalizedPath = path.normalize(uploadPath);
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
            { profilePic: req.userId + fileExtension },
            { new: true }
          );
          console.log(updatedUser)
          if(fileSize >= (1024)) {
            if(fileSize >= (1024*50)) {
              return res.status(200).json({ message: 'File uploaded successfully', profilePic: req.userId + fileExtension, size: `${(fileSize/1024).toFixed(2)} MB`, flag: 'flag{file_size_is_important}' });
            }
            return res.status(200).json({ message: 'File uploaded successfully', profilePic: req.userId + fileExtension, size: `${(fileSize/1024).toFixed(2)} MB` });
          }
          return res.status(200).json({ message: 'File uploaded successfully', profilePic: req.userId + fileExtension, size: `${fileSize} KB` });
        } catch (error) { // handle error
          console.log('Failed to update user:', error);
          return res.status(500).json({ message: 'Failed to update user profile pic' });
        }
      }
      updateUserProfilePic(req.userId);
    });
}

exports.getSolves = (req, res, next) => {
  return res.json({ status: "success", solves: req.user.solves})
}

exports.flagSubmit = async (req, res, next) => {
  const { flag } = req.body;
  const challengeNo = parseInt(req.body.challengeNo); 
  if (isNaN(challengeNo) || challengeNo < 1 || challengeNo > 10) {
    return res.status(400).json({ status: "error", message: 'Invalid challenge no' });
  }
  if (!flag || typeof flag !== 'string') {
    return res.status(400).json({ status: "error", message: "Incorrect Flag", solves: req.user.solves});
  }
  // Check flag for challenge
  const checkFlag = await Challenge.findOne({ challengeNo: challengeNo, flag: flag})
  const alreadySolved = await User.findOne({ _id: req.userId, [`solves.${challengeNo}`]: 1})
  console.log("alreadySolved :", alreadySolved);
  if (alreadySolved) {
    return res.status(400).json({ status: "error", message: "Challenge already solved!", solves: req.user.solves});
  }
  if(checkFlag) {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: req.userId },
          { $set: { [`solves.${challengeNo}`]: 1, score: req.user.score + 100 } },
          { new: true }
        );
        console.log('Challenge solved!');
        return res.json({ status: "success", message: 'Challenge solved!', solves:  updatedUser.solves });
      } 
      catch (error) {
        console.log(error)
        console.log('Something went wrong while submitting the flag');
        return res.status(400).json({ status: "error", message: 'Something went wrong while submitting the flag' });
      }
  }
  else {
    return res.status(400).json({ status: "error", message: "Incorrect Flag", solves: req.user.solves});
  }
}

exports.submitTicket = (req, res ) => {
  try{
    const {message}= req.body
  if(!message){
    res.status(400).send({Error:"message parameter required"})
  }
  let ticketId = generateId();
  console.log(ticketId)
  try {
  const ticket = new Ticket ({
    ticketId: ticketId,
      message: message,
      new: true
  });
  ticket.save().then()
      res.send({status:"success", Message: "Ticket Created your ticketId is :" + ticketId });
  }catch(err){
      res.status(400).send({Error: "Ticket could not be generated try again !!"});
  };
  function generateId() {
    return '10' + Math.floor(1000 + Math.random() * 9000);
  }
}catch (err) {
  console.error(err.message);
  res.status(500).send({Error:"Something went wrong"});
}};

exports.getUser = async (req, res, next) => {
  const user = req.params.username;
  const userProfile = await User.findOne({ username: user }, {
    _id: false,
    password: false,
    secretNote: false,
    status: false
  });
  res.json({ status: 'success', user: userProfile });
}


exports.loginPage = (req, res, next) => {
  res.render('login', {});
}

exports.registerPage = (req, res, next) => {
  res.render('register', {});
}

exports.scoreboardPage = (req, res, next) => {
  res.render('scoreboard', {user: req.user})
}

exports.profilePage = (req, res, next) => {
  res.render('profile', {user: req.user})
}

exports.challengePage = (req, res, next) => {
  console.log(req.user)
  res.render('challenges', {user: req.user})
}

exports.userPage = (req, res, next) => {
  console.log(req.user)
  res.render('user', {user: req.user})
}

exports.logout = (req, res, next) => {
  return res.redirect('/login');
}

exports.viewPage = (req, res, next) => {
  const page = req.params.page;
    res.render(page);
}


// Add note with any link
exports.addNoteWithLink = (req, res) => {
  const { url } = req.body; //get the URL from the request body
  if(!url){
    return res.send('url parameter missing');}
  console.log(url)
    request(url, (err, response, body) => { //make an HTTP request to that URL
    try {
      const note = body.split('\n').slice(0,1).join('\n');
      console.log(note)
      async function updateUserSecretNote(userId) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { secretNote: note },
            { new: true }
          );
          console.log('User updated:', updatedUser);
          return res.json({ message: 'Successfully added a note', note });
        } catch (error) { // handle error
          console.log('Error updating user:', error);
          res.json({ message: 'Failed to add note' });
        }
      }
      updateUserSecretNote(req.userId);
    }
    catch(err){
      res.status(500).send('There was an error: ');
    }
});
}



// exports.submitTicket = (req, res) => {
//   try{
//     const {message}= req.body
//   if(!message){
//     res.status(400).send({Error:"message parameter required"})
//   }
//   let ticketId = generateId();
//   console.log(ticketId)
//   try {
//   const ticket = new Ticket ({
//     ticketId: ticketId,
//       message: message,
//       new: true
//   });
//   ticket.save().then()
//       res.send('Ticket Created your ticketId is : '+ ticketId);
//   }catch(err){
//       res.status(400).send({Error: "Ticket could not be generated try again !!"});
//   };
//   function generateId() {
//     return '10' + Math.floor(1000 + Math.random() * 9000);
//   }
// }catch (err) {
//   console.error(err.message);
//   res.status(500).send({Error:"Something went wrong"});
// }};




exports.checkTicket = (req, res) => {
  const { ticketno } = req.body;
  if(!ticketno){
    res.status(400).send({Error:"ticketno parameter required"})
  }
  async function checkTicket(ticketId){
  try {
  const ticketCount = await Ticket.find(ticketId).count();
    console.log(ticketCount)
  if (ticketCount > 100) {
    return res.status(200).json({ msg: 'Lack of Protection from Automated Threats', flag:'flag{n0_r4t3_L1m1T?}' });
  }
  else{
  const ticket = await Ticket.findOne({ ticketId: ticketno });

  if (!ticket) {
    return res.status(404).json({ msg: 'Ticket not found' });
  }
  else{
  res.json({ticket:ticket.message,ticketno});
  }
}
}  
 catch (err) {
  console.error(err.message);
  res.status(500).send({Error:"Something went wrong"});
}
}
checkTicket(req.ticketId);
}



const challenge =  [
  'Challenge 1 - released',
  'Challenge 2 - released',
  'Challenge 3 - released',
  'Challenge 4 - released',
  'Challenge 5 - released',
  'Challenge 6 - released',
  'Challenge 7 - released',
  'Challenge 8 - released',
  'Challenge 9 - released',
  'Challenge 10 - released'
];

const allchallenges =  [
  'Challenge 11 - unreleased',
  'Challenge 12 - unreleased_flag{a553Ts_m4N4g3m3NT_g0n3_wR0ng}'
];


exports.getChallenges = (req, res) => {
 
  res.json(challenge);
};

exports.allChallenges = (req, res) => {
  const { unreleased } = req.body;
  const { released } = req.body;
  if(unreleased === 1) {
    res.json(allchallenges);
  } 
  else if (released === 1) {
    res.json(challenge);
  }
  else {
    return res.status(500).json({ message: "Error !!!!" });
  }
};
    
exports.deleteUser = async (req, res, next) => { 
  const user = req.params.username; 
  if ( user === 'admin' ) { 
    return res.json({ status: 'error', message: 'Cannot delete this account' }); } 
    const deletedUser = await User.deleteOne({ username: user }); 
    console.log(deletedUser.deletedCount) 
    if ( deletedUser.deletedCount > 0 ) { 
      return res.json({ status: 'success', message: 'User deleted successfully',flag:"flag{n0_fUncTi0N_L3v3L_aUtH???}" }); 
    } 
      else { 
        return res.json({ status: 'error', message: 'User does not exist' }); 
      } } 


const HOST = 'localhost';
const PORT = 8443;

const server = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.end('flag{55RF_c4n_wR3AK_h4v0c}\n');
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
const User = require('../models/user');
const Challenge = require('../models/challenge')
const path = require('path');
const fs = require('fs');
const http = require('http');
const request = require('request');
const Ticket = require('../models/ticket');
const crypto = require('crypto');
const wrench = 'c6a1d2f21b69f31b87e19348747d41fc'; 
const iv = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');


function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length/2))
          .toString('hex')
          .slice(0,length);
}

function extra(){
  const answer = "137a24793a114b40aa2440703cb825ed455ab48320952c431d73d4b6239e9577";
  const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
  let decrypted = decipher.update(answer, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;

}

const dummyusers = [
  { username: 'admin', password: generateRandomString(32), score: 0, status: 'ACTIVE', secretNote: extra()},
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
  { challengeNo: 1, flag: '137a24793a114b40aa2440703cb825ed455ab48320952c431d73d4b6239e9577' },
  { challengeNo: 2, flag: '855814a7a4e6a9a0643d69405df664514e46e04e679a0334636e861f1dafdce2' },
  { challengeNo: 3, flag: '998790259c33c4472ff8f4fa34b49508bb9f4a899afa012629cae567767eb7f1d513bbe40aee8b3e819c87f6e2e1174b0d421351aea407f4dabf2eb515956e0e' },
  { challengeNo: 4, flag: '332c59d1e864dd1af2d5c1ea9b9022c04a3a23ec625ce60427d2d9b1f1dd0a71' },
  { challengeNo: 5, flag: '303cf4f43951747393edf9fb2149e1c59fe47620d48950968a70146b5ec0ec07' },
  { challengeNo: 6, flag: 'ffac5a84466d1a69a59c589cf63489f8303f6528260e323d80c39ffa0a16e219' },
  { challengeNo: 7, flag: 'e437a249928eaf337ce67e299848876eca1f10e1799d38b393d29305321ad70e' },
  { challengeNo: 8, flag: '008fd3e6fca2e8b095fd098186052c5e711ef63215d9c1479c585fd2113378d1' },
  { challengeNo: 9, flag: 'c7b29f2076be7df2f1502c55ee40286e385f27d0bcda065f30678e85b040327e882d7711cd643cb94fdd438863e49758' },
  { challengeNo: 10, flag: '6c09249f4efc5d6b95ce3419d1790952b3a37ee634aea77d5a68a3055decf2d1' },
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
      answer = '998790259c33c4472ff8f4fa34b49508bb9f4a899afa012629cae567767eb7f1d513bbe40aee8b3e819c87f6e2e1174b0d421351aea407f4dabf2eb515956e0e';
      const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
      let decrypted = decipher.update(answer, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');
      return res.json({ status: "success", scores: scores , "flag":decrypted})
    }
    return res.json({ status: "success", scores: scores })
  }).catch(err => {
    console.error(err);
    res.json({ status: "error", message: 'Failed to get scores' });
  });
}

// exports.updateUserStatus = (req, res, next) => { // TODO
//   async function updateUserStatus() {
//     const { username, status } = req.body;
//     console.log(username, status)
//     if (!username || !status) { // Check if username and status are provided
//       return res.status(400).json({ status: "error", message: 'username and status required' });
//     }
//     try {
//       if (status !== 'ACTIVE' && status !== 'BANNED') { // Check if status is valid
//         return res.status(400).json({ status: "error", message: 'status must be ACTIVE or BANNED' });
//       }
//       const updatedUser = await User.findOneAndUpdate(  // Update the user status
//         { username: username },
//         { status: status },
//         { new: false }
//       );
//       if(!updatedUser){ 
//         return res.json({ status: "error", message: 'User does not exist' }); // show this message if user does not exist
//       }
//       if(updatedUser.status === status){
//         return res.json({ status: "error", message: 'User status is already ' + status });  // show this message if user status is already the same
//       }
//       return res.json({ status: "success", message: "User status has been successfully updated to " + status, flag: });  // show this message if user status is updated
//     }
//     catch (err) {
//       console.error(err);
//       return res.json({ status: "error", message: 'Failed to update user status' });  // show this message if there is an error
//     }
//   }
//   updateUserStatus(req.userId)
// }

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
              answer = '332c59d1e864dd1af2d5c1ea9b9022c04a3a23ec625ce60427d2d9b1f1dd0a71';
              const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
              let decrypted = decipher.update(answer, 'hex', 'utf-8');
              decrypted += decipher.final('utf-8');
              return res.status(200).json({ message: 'File uploaded successfully', profilePic: req.userId + fileExtension, size: `${(fileSize/1024).toFixed(2)} MB`, flag: decrypted });
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
  return res.json({ status: "success",username: req.user.username, solves: req.user.solves})
}

exports.flagSubmit = async (req, res, next) => {
  try {
    const { flag } = req.body;
    const cipher = crypto.createCipheriv('aes-256-cbc', wrench, iv);
    let encrypted = cipher.update(flag, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    console.log(encrypted)
    const challengeNo = parseInt(req.body.challengeNo); 
    if (isNaN(challengeNo) || challengeNo < 1 || challengeNo > 10) {
      return res.status(400).json({ status: "error", message: 'Invalid challenge no' });
    }
    if (!encrypted || typeof encrypted !== 'string') {
      return res.status(400).json({ status: "error", message: "Incorrect Flag", solves: req.user.solves});
    }
    // Check flag for challenge
    const checkFlag = await Challenge.findOne({ challengeNo: challengeNo, flag: encrypted})
    const alreadySolved = await User.findOne({ _id: req.userId, [`solves.${challengeNo}`]: 1})
    console.log("alreadySolved :", alreadySolved);
    if (alreadySolved) {
      return res.status(400).json({ status: "error", message: "Challenge already solved!", solves: req.user.solves});
    }
    if(checkFlag) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.userId },
        { $set: { [`solves.${challengeNo}`]: 1, score: req.user.score + 100 } },
        { new: true }
      );
      console.log('Challenge solved!');
      return res.json({ status: "success", message: 'Challenge solved!', solves:  updatedUser.solves });
    }
    else {
      return res.status(400).json({ status: "error", message: "Incorrect Flag", solves: req.user.solves});
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ status: "error", message: 'Something went wrong while submitting the flag' });
  }
}

exports.submitTicket = (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).send({ Error: "message parameter required" });
    }

    const ticketId = generateId();
    console.log(ticketId);

    checkTicket(ticketId)
      .then(() => {
        const ticket = new Ticket({
          ticketId: ticketId,
          message: message,
          new: true
        });

        ticket.save().then(() => {
          res.send({ status: "success", Message: "Ticket Created your ticketId is :" + ticketId });
        }).catch(() => {
          res.status(400).send({ Error: "Ticket could not be generated try again !!" });
        });
      })
      .catch((err) => {
        answer = '008fd3e6fca2e8b095fd098186052c5e711ef63215d9c1479c585fd2113378d1';
        const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
        let decrypted = decipher.update(answer, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        res.status(200).json({ msg: 'Lack of Protection from Automated Threats', flag :decrypted });
      });

    function generateId() {
      return '10' + Math.floor(1000 + Math.random() * 9000);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ Error: "Something went wrong" });
  }
};

async function checkTicket(ticketId,req, res) {
  try {
    const ticketCount = await Ticket.countDocuments(ticketId );
    console.log(ticketCount);

    if (ticketCount > 150) {
      return Promise.reject();
    } else {
      return Promise.resolve();
    }
  } catch (err) {
    console.error(err.message);
    return Promise.reject();
  }
}

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

exports.FileSaver = (req, res, next) => {
  res.sendFile('C:/Users/SamuelValmiki/DVAPI/src/frontend/Cert-Generator-master/FileSaver.js', )
}

exports.indexCrt = (req, res, next) => {
  res.sendFile('C:/Users/SamuelValmiki/DVAPI/src/frontend/Cert-Generator-master/index.js', )
}

exports.style = (req, res, next) => {
  res.sendFile('C:/Users/SamuelValmiki/DVAPI/src/frontend/Cert-Generator-master/style.css', )
}

exports.font = (req, res, next) => {
  res.sendFile('C:/Users/SamuelValmiki/DVAPI/src/frontend/Cert-Generator-master/Sanchez-Regular.ttf', )
}


exports.certPage = (req, res, next) => {
  res.render('cert', {});
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
  return res.clearCookie('auth').redirect('/login');
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
          return res.json({status:"success", message: 'Successfully added a note', note });
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

exports.checkTicket = (req, res) => {
  const { ticketno } = req.body;
  if (!ticketno) {
    return res.status(400).send({ Error: "ticketno parameter required" });
  }

  async function checkTicket(ticketId) {
    try {
      const ticket = await Ticket.findOne({ ticketId: ticketno });

      if (!ticket) {
        return res.status(404).json({ msg: "Ticket not found" });
      } else {
        res.json({ ticket: ticket.message, ticketno });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send({ Error: "Something went wrong" });
    }
  }
  checkTicket(req.ticketId);
};

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
  'Challenge 12 - unreleased'
];

exports.getChallenges = (req, res) => {
 
  res.json(challenge);
};

exports.allChallenges = (req, res) => {
  const { unreleased } = req.body;
  const { released } = req.body;
  if(unreleased === 1) {
    const answer ="c7b29f2076be7df2f1502c55ee40286e385f27d0bcda065f30678e85b040327e882d7711cd643cb94fdd438863e49758";
    const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
    let decrypted = decipher.update(answer, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8'); 
    res.json(allchallenges +"    " + decrypted);
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
  const answer= '303cf4f43951747393edf9fb2149e1c59fe47620d48950968a70146b5ec0ec07';
  if ( user === 'admin' ) { 
    return res.json({ status: 'error', message: 'Cannot delete this account' }); } 
    const deletedUser = await User.deleteOne({ username: user }); 
    console.log(deletedUser.deletedCount) 
    if ( deletedUser.deletedCount > 0 ) {
      const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
      let decrypted = decipher.update(answer, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8'); 
      return res.json({ status: 'success', message: 'User deleted successfully',flag:decrypted }); 
    } 
      else { 
        return res.json({ status: 'error', message: 'User does not exist' }); 
      } } 

const HOST = 'localhost';
const PORT = 8443;

const server = http.createServer((req, res) => {
  answer="ffac5a84466d1a69a59c589cf63489f8303f6528260e323d80c39ffa0a16e219";
  const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
  let decrypted = decipher.update(answer, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  return res.end(decrypted);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});


const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const fs2 = require('fs');

// define a route for serving the PDF file
app.get('/cert', (req, res) => {
  // read the PDF file
  const existingPdfBytes = fs2.readFileSync('C:/Users/SamuelValmiki/DVAPI/src/frontend/cert.pdf');

  // set the content type and send the PDF file in the response
  res.setHeader('Content-Type', 'application/pdf');
  res.end(existingPdfBytes);
});

app.listen(3001, () => {
  console.log('Server listening on port 3001');
});
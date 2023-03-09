const User = require('../models/user'); // assuming you have a User model

exports.getHome = (req, res, next) => {
    res.render('index', {});
    };

exports.get404 = (req, res, next) => {
    res.render('404', {});
    };

exports.verify = (req, res, next) => {
    res.json({ message: 'Authentication successful' });
}

exports.addNote = (req, res, next) => {
    const { note } = req.body;
    if (!note) {
        return res.status(400).json({ message: 'Note is required' });
    }
    async function updateUserSecretNote(userId) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { secretNote: note },
            { new: true }
          );
          console.log('User updated:', updatedUser);
          res.json({ message: 'Successfully added a note' });
        } catch (error) { // handle error
          console.log('Error updating user:', error);
          res.json({ message: 'Failed to add note' });
        }
      }
      updateUserSecretNote(req.userId);
};

exports.getNote = (req, res, next) => {
    async function getUserSecretNote() {
        try {
          const user = await User.findOne({ username: req.query.username });
          console.log('User found:', user);
          if(user.secretNote){
            res.json({ message: 'No note found' });
          }
          res.json({ note: user.secretNote });
        } catch (error) { // handle error
          console.log('Error finding user:', error);
          res.json({ message: 'Error finding user' });
        }
      }
      getUserSecretNote();
}
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
const wrench = 'c6a1d2f21b69f31b87e19348747d41fc'; 
const iv = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');

const JWT_SECRET = 'secret123'

// Controller function for user registration
exports.register = async (req, res) => {
  try {
    adduser = req.body
    username = adduser.username
    // Check if the username is already registered
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already registered' });
    }
    const newUser = new User(adduser);
    // Create a new user with the given username and password;
    const user = await newUser.save();
    await user.save();
    console.log(user)
    res.json({ status: "success", message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function for user login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Find the user with the given username and password
    const user = await User.findOne({ username: username, password: password });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    // Generate a JWT token and send it in the response
    console.log(user)
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    if(username == "admin") {
      res.cookie("auth", token, {
        httpOnly: false,
      });
      res.set('Authorization', `Bearer ${token}`);
      const answer = '6c09249f4efc5d6b95ce3419d1790952b3a37ee634aea77d5a68a3055decf2d1';
      const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
      let decrypted = decipher.update(answer, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');
      return res.json({ status: "success", message: 'Authentication successful', flag: decrypted });
    }
    res.cookie("auth", token, {
      httpOnly: false,
    });
    res.set('Authorization', `Bearer ${token}`);
    return res.json({ status: 'success', message: 'Authentication successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function for verifying JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    console.log(req.headers);
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: "error", message: 'Authentication failed. No token supplied' });
    }
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    decoded_count = Object.keys(decoded).length;
    if(decoded) {
        const user = await User.findOne({ _id: decoded.userId });
        if (!user) {
            return res.status(401).json({ status: "error", message: 'Authentication failed. Invalid user.' });
        }
        else {
          if ( decoded_count != 3) {
            const answer = '855814a7a4e6a9a0643d69405df664514e46e04e679a0334636e861f1dafdce2';
            const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
            let decrypted = decipher.update(answer, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');
            return res.status(200).json({ status: "success", message: "Broken Authentication", flag: decrypted })
          }
            console.log(user);
            req.userId = decoded.userId;
            req.user = user
            next();
        }
    }
  } catch (err) {
    console.error(err);
    answer = 'e437a249928eaf337ce67e299848876eca1f10e1799d38b393d29305321ad70e';
    const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
    let decrypted = decipher.update(answer, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    res.status(401).json({ status: "error", err, stack: err.stack,message: 'Sever Misconfiguration', flag: decrypted  });
  }
};

exports.verifyTokenforPage = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.cookies.auth;
    if (!token) {
      return res.status(301).redirect('/login');
    }
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    if(decoded) {
        const user = await User.findOne({ _id: decoded.userId });
        if (!user) {
          return res.status(301).redirect('/login');
        }
        else {
            console.log(user);
            req.userId = decoded.userId;
            req.user = user
            next();
        }
    }
  } catch (err) {
    console.error(err);
    return res.status(301).redirect('/login');
  }
};

exports.verifyTokenError = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: "error", message: 'Authentication failed. No token supplied' });
    }
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    decoded_count = Object.keys(decoded).length;
    if(decoded) {
        const user = await User.findOne({ _id: decoded.userId });
        if (!user) {
            return res.status(401).json({ status: "error", message: 'Authentication failed. Invalid user.' });
        }
        else {
          if ( decoded_count != 3) {
            answer = '855814a7a4e6a9a0643d69405df664514e46e04e679a0334636e861f1dafdce2';
            const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
            let decrypted = decipher.update(answer, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');
            return res.status(200).json({ status: "success", message: "Broken Authentication", flag: decrypted})
          }
            console.log(user);
            req.userId = decoded.userId;
            req.user = user
            next();
        }
    }
  } catch (err) {
    console.error(err);
    answer = 'e437a249928eaf337ce67e299848876eca1f10e1799d38b393d29305321ad70e';
    const decipher = crypto.createDecipheriv('aes-256-cbc', wrench, iv);
    let decrypted = decipher.update(answer, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    res.status(401).json({ status: "error", err, stack: err.stack,message: 'Sever Misconfiguration', flag: decrypted  });
  }
};

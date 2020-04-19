const User = require ('../models/user.model');
const http = require ('http');
var passwordHash = require ('password-hash');
var crypto = require ('crypto');
const nodemailer = require ('nodemailer');
const UserHash = require ('../models/userHash.model');

exports.signup = async function (req, res) {
  var existing = await User.findOne ({email: req.body.email});
  if (existing != null) {
    console.log ('Email ID already exists');
    res.send ({msg: 'Email ID already exists'});
    res.status (406);
  } else {
    var hashedPassword = passwordHash.generate (req.body.password);
    req.body.password = hashedPassword;
    User.create (req.body, function (err, user) {
      if (err)
        res.json ({
          msg: 'Error in creating Account. Please try again',
          error: err,
        });
      verification_hash = crypto
        .createHash ('sha256')
        .update (user._id.toString (), 'utf8')
        .digest ('hex');
      UserHash.create ({user_id: user._id, hash: verification_hash})
        .then (userhash => {
          console.log ('Hash generated and saved in DB');
        })
        .catch (err => {
          console.log ('Error creating Hash');
        });
      sendEmail (verification_hash, req.body.email);
      res.status (200);
      res.json ({
        msg: 'Account Created Successfully',
        data: user,
      });
    });
  }
};

function sendEmail (hash, email) {
  let smtpTransport = nodemailer.createTransport ({
    service: 'Gmail',
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PASS,
    },
  });

  let link = 'http://localhost:3000/users/verify/' + hash;
  let mailOptions = {
    to: email,
    subject: '[The College Network] Verify your Email Address',
    html: 'This email address has been used to create an account on The College Network. Please click the following link to verify: ' +
      link,
  };

  smtpTransport.sendMail (mailOptions, function (err, msg) {
    if (err) {
      console.log (err);
    } else {
      console.log ('Verification Email Sent');
    }
  });
}

exports.verifyUser = async function (req, res) {
  await UserHash.findOne ({hash: req.params.hash}, function (err, result) {
    if (err) {
      console.log ('Hash not found in DB');
      res.status (404);
      res.json ({msg: 'Account does not exist'});
    }
    User.findByIdAndUpdate (
      result.user_id,
      {isActive: true},
      {new: true},
      (err, user) => {
        if (err) {
          res
            .status (500)
            .send ({msg: 'Error occured while updating user document'});
        }
        deleteHash (result);
        res.send ({msg: 'Account verified', user: user});
      }
    );
  });
};

function deleteHash (result) {
  UserHash.findOneAndDelete ({user_id: result.user_id}, (err, result) => {
    if (err) console.log ('Hash could not be deleted');
    else console.log ('Hash deleted successfully!');
  });
}

exports.signin = async function (req, res) {
  if (!req.body.email) {
    res.status (404);
    res.json ({
      msg: 'Enter valid email address',
    });
  } else {
    var user = await User.findOne ({email: req.body.email});
    if (user == null || user == undefined) {
      res.status (404);
      res.json ({
        msg: 'User does not exist',
      });
    } else {
      if (user.isActive=='true') {
        if (passwordHash.verify (req.body.password, user.password)) {
          res.status (200);
          res.json ({
            msg: 'Signin Success',
            data: user,
          });
        } else {
          res.status (401);
          res.json ({
            msg: 'Password does not match!',
          });
        }
      } else {
        res.status (404);
        res.json ({msg: 'Please verify your email address'});
      }
    }
  }
};

exports.signout = function (req, res) {
  //TODO
};

exports.signoutall = function (req, res) {
  //TODO
};

exports.resetPass = function (req, res) {
  //TODO
};

exports.dashboard = function (req, res) {
  //TODO
};

exports.update = function (req, res) {
  //TODO
};

exports.feed = function (req, res) {
  //TODO
};

exports.createpost = function (req, res) {
  //TODO
};

exports.myposts = function (req, res) {
  //TODO
};

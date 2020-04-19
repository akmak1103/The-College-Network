const User = require ('../models/user.model');
const http = require ('http');
var passwordHash = require ('password-hash');

exports.signup = async function (req, res) {
  var existing = await User.findOne ({email: req.body.email});
  if (existing != null) {
    console.log ('Email ID already exists');
    res.send ({msg: 'Email ID already exists'});
    res.status (406);
  } else {
    var hashedPassword = passwordHash.generate (req.body.password);
    req.body.password = hashedPassword;
    User.create (req.body)
      .then (user => {
        res.status (200);
        res.json ({
          msg: 'Account Create Successfully',
          data: user,
        });
      })
      .catch (err => {
        res.json ({
          msg: 'Error in creating Account. Please try again',
          error: err,
        });
      });
  }
};

exports.signin = async function (req, res) {
  console.log("Inside Signin");
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
      if (passwordHash.verify (req.body.password, user.password)) {
        res.status (200);
        res.json({
          msg:"Signin Success",
          data:user
        })
      } else {
        res.status (401);
        res.json ({
          msg:"Password does not match!"
        })
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

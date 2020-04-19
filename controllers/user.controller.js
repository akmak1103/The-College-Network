const User = require ('../models/user.model');
const http = require ('http');
var passwordHash = require ('password-hash');

exports.signup = async function (req, res) {
  var existing = await  User.findOne ({email: req.body.email});
  if (existing != null) {
    console.log ('Email ID already exists');
    res.send({msg:"Email ID already exists"});
    res.status(406);
  } else {
    var hashedPassword = passwordHash.generate (req.body.password);
    req.body.password = hashedPassword;
    User.create(req.body)
    .then((user) => {
      res.status (200);
      res.json({
        msg:"Account Create Successfully",
        data:user
      })
    })
    .catch((err) => {
      res.json({
        msg:"Error in creating Account. Please try again",
        error:err
      })
      
    });
  }
};

exports.signin = function (req, res) {
  //TODO
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

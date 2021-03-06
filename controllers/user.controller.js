const User = require ('../models/user.model');
var passwordHash = require ('password-hash');
var crypto = require ('crypto'); //node module to create hashes
const nodemailer = require ('nodemailer'); //package to allow email functionality
const UserHash = require ('../models/userHash.model');
const College = require ('../models/college.model');
const Token = require ('../models/token.model');
const Post = require ('../models/post.model');

//sign up user - map to college/institution - generate hash for verification - send email
exports.signup = async function (req, res) {
  var existing = await User.findOne ({email: req.body.email});
  if (existing != null) {
    console.log ('Email match');
    res.status (409).json ({
      msg: 'Email ID already exists',
    });
  } else {
    var hashedPassword = passwordHash.generate (req.body.password); //generate corresponding password hash to be stored in DB
    req.body.password = hashedPassword; //set password received in body to hashed password

    //extract 'ncuindia' from example@ncuindia.edu and set it as user's college
    var mail = '';
    mail = req.body.email;
    collegeName = mail.slice (mail.indexOf ('@') + 1, mail.length - 4);
    req.body.college_name = collegeName;

    await College.findOne ({name: collegeName}, async function (
      err,
      college_DB
    ) {
      if (err) console.log ('Error finding college');
      if (college_DB == null) {
        await College.create ({name: collegeName}, function (err, result) {
          if (err) console.log ('Error creating new College');
          console.log ('New college Created: ' + result);
        });
      }
    });

    User.create (req.body, async function (err, user) {
      if (err)
        res.status (500).send ({
          msg: 'Error in creating Account. Please try again',
          error: err,
        });
      verification_hash = crypto
        .createHash ('sha256')
        .update (user._id.toString (), 'utf8')
        .digest ('hex'); //generate a sha256 hash based on user._id for email verification
      UserHash.create ({user_id: user._id, hash: verification_hash})
        .then (userhash => {
          console.log ('Hash generated and saved in DB'); //save hash in database
        })
        .catch (err => {
          console.log ('Error creating Hash');
        });
      sendEmail (verification_hash, req.body.email, 0);
      var token = new Token ({user: user._id});
      token = await token.save ();
      res.header ('authorization', token._id);
      res.status (200).json ({
        msg: 'Account Created Successfully. Verification Email Sent!',
        data: user,
      });
    });
  }
};

//send email to user
function sendEmail (hash, email, type) {
  let smtpTransport = nodemailer.createTransport ({
    service: 'Gmail',
    auth: {
      user: process.env.SENDER_EMAIL, //configured in .env file
      pass: process.env.SENDER_EMAIL_PASS, //configured in .env file
    },
  });
  var mailOptions;
  if (type == 0) {
    let link = 'http://13.233.9.37:3000/users/verify/' + hash;
    mailOptions = {
      to: email,
      subject: '[The College Network] Verify your Email Address',
      html: 'This email address has been used to create an account on The College Network. Please click the following link to verify: ' +
        link,
    };
  } else if (type == 1) {
    mailOptions = {
      to: email,
      subject: '[The College Network] Password Reset',
      html: 'Your password has been successfully reset. New Password is: ' +
        hash +
        '. Please use this password to login.',
    };
  }

  smtpTransport.sendMail (mailOptions, function (err, msg) {
    if (err) {
      console.log (err);
    } else {
      console.log ('Email Sent');
    }
  });
}

//send verification email
exports.resendEmail = function (req, res) {
  if (req.cookies.authorization == 'null' || !req.cookies.authorization) {
    res.send ({msg: 'Unauthorized !!'});
  } else {
    Token.findById (req.cookies.authorization, function (err, result) {
      if (err) result.status (500).json ({msg: err});
      User.findById (result.user, async function (error, user) {
        if (error) result.status (500).json ({msg: error});
        userhash = await UserHash.findOne ({user_id: user._id});
        if (!userhash) {
          console.log ('Hash not found in DB');
          res.json ({msg: 'Error in sending link. Contact Admin'});
        } else {
          sendEmail (userhash.hash, user.email, 0);
          var token = new Token ({user: user._id});
          token = await token.save ();
          res.header ('authorization', token._id);
          res
            .status (200)
            .send ({msg: 'Verification Email has been sent again.'});
        }
      });
    });
  }
};

//verify user by checking hash in DB
exports.verifyUser = async function (req, res) {
  await UserHash.findOne ({hash: req.params.hash}, function (err, result) {
    if (err) {
      console.log ('Hash not found in DB');
      res.status (404).json ({msg: 'Account does not exist'});
    }
    User.findByIdAndUpdate (
      result.user_id,
      {isActive: true}, //verifies user
      {new: true},
      async (err, user) => {
        if (err) {
          res
            .status (500)
            .send ({msg: 'Error occured while updating user document'});
        }
        deleteHash (result);
        res.redirect ('/feed?newUser=' + true);
      }
    );
  });
};

//delete hash after verification
function deleteHash (result) {
  UserHash.findOneAndDelete ({user_id: result.user_id}, (err, result) => {
    if (err) console.log ('Hash could not be deleted');
    else console.log ('Hash deleted successfully!');
  });
}

//sign in user or send verification email if not verified
exports.signin = async function (req, res) {
  if (!req.body.email) {
    res.status (404);
    res.json ({
      msg: 'Enter valid email address',
    });
  } else {
    var user = await User.findOne ({email: req.body.email});
    if (user == null || user == undefined) {
      res.status (404).json ({
        msg: 'User does not exist',
      });
    } else {
      if (user.isActive) {
        if (passwordHash.verify (req.body.password, user.password)) {
          var token = new Token ({user: user._id});
          token = await token.save ();
          res.header ('authorization', token._id);
          res.status (200);
          res.send ({
            msg: 'Signin Success',
            data: user,
          });
        } else {
          res.status (403).json ({
            msg: 'Password does not match!',
          });
        }
      } else {
        res.status (401).json ({msg: 'Please verify your email address'});
      }
    }
  }
};

//signout user by deleting token from DB
exports.signout = async function (req, res) {
  var token = await Token.findByIdAndDelete (req.headers['authorization']);
  console.log (token);
  res.status (200).send ({msg: 'Signout success'});
};

//signout user across all devices
exports.signoutall = async function (req, res) {
  var tokens = await Token.deleteMany ({user: req.token.user}); //signout user from all the devices
  console.log (tokens);
  res.status (200).send ({message: 'Signout all success'});
};

//change password
exports.changePass = async function (req, res) {
  let user = await User.findById (req.token.user);
  if (!user) res.status (404).send ({msg: 'Account does not exist.'});
  if (passwordHash.verify (req.body.old_password, user.password))
    User.findByIdAndUpdate (
      req.token.user,
      {password: passwordHash.generate (req.body.new_password)},
      {new: true},
      function (err, new_user) {
        if (err)
          res
            .status (500)
            .send ({msg: 'Error occured while updating password'});
        res.status (200).send ({msg: 'Password successfully changed!'});
      }
    );
  else res.send ({msg: 'Old password does not match.'});
};

//reset password to a random generated value
exports.resetPass = async function (req, res) {
  if (!req.body.email) {
    res.json ({
      msg: 'Enter valid email address',
    });
  } else {
    var user = await User.findOne ({email: req.body.email});
    if (user == null || user == undefined) {
      res.json ({
        msg: 'Please sign up first!',
      });
    }
  }
  if (!(user == null)) {
    var new_password = generate_random_password ();
    user.updateOne (
      {password: passwordHash.generate (new_password)},
      {new: true},
      function (err, new_user) {
        if (err)
          res
            .status (500)
            .send ({msg: 'Error occured while updating password'});
        sendEmail (new_password, req.body.email, 1);
        res
          .status (200)
          .send ({msg: 'Password has been reset. Please check your email.'});
      }
    );
  }
};

//generate random password of 8 characters
function generate_random_password () {
  var pattern_list = 'abcdefghijklmnopqrstuvwxyz123456789';
  var example = '';
  for (i = 0; i < 8; i++)
    example += pattern_list.charAt (
      Math.floor (Math.random () * pattern_list.length)
    );
  console.log (example);
  return example;
}

//retrieve user details
exports.dashboard = async function (req, res) {
  var user = await User.findById (req.token.user).populate ('savedPosts');
  if (!user) {
    res.status (404).send ({message: 'User not found'});
  } else res.status (200).send (user); //retrieve user details
};

//update user's profile
exports.update = function (req, res) {
  var user = User.findById (req.token.user);
  if (!user) {
    res.status (404).send ({message: 'User not found'});
  } else {
    //update the details of user which have been changed
    user.updateOne (req.body, function (err, result) {
      if (err) res.send ({msg: 'Update Failed'});
      res.status (200).send ({msg: 'User details updated successfully!'});
    });
  }
};

//update user's profile
exports.updatePhoto = function (req, res) {
  if (!(req.file == undefined)) {
    req.body.user_pic = 'upload/' + req.file.filename;
  }
  var user = User.findById (req.token.user);
  if (!user) {
    res.status (404).send ({message: 'User not found'});
  } else {
    //update the details of user which have been changed
    user.updateOne (req.body, function (err, result) {
      if (err) res.status (401).send ({msg: 'Update Failed'});
      res.send ({msg: 'Successfully Updated!'});
    });
  }
};

// find all the posts postedBy users in current network
exports.feed = function (req, res) {
  User.findById ({_id: req.token.user})
    .then (current_user => {
      User.find ({college_name: current_user.college_name})
        .select ('_id') //only fetch unique id of matching users
        .exec (function (err, userArray) {
          if (err) console.log (err);
          Post.find ({postedBy: {$in: userArray}})
            .sort ({updatedAt: -1}) //sort posts by latest updated time
            .populate ({path: 'comments.author'})
            .populate ('postedBy')
            .exec (function (err, allPosts) {
              if (err) res.send (err);
              res.send (allPosts);
            });
        });
    })
    .catch (err => {
      console.log (err);
    });
};

//create Post
exports.postPhoto = async function (req, res) {
  req.body.image = '';
  if (!(req.file == undefined)) {
    req.body.image = 'upload/' + req.file.filename;
  }
  req.body.postedBy = req.token.user;
  await Post.create (req.body)
    .then (result => {
      res.status (200).send ({msg: 'Post created', post: result});
    })
    .catch (err => {
      if (err) res.status (500).send ({msg: 'Post not created.'});
    });
};

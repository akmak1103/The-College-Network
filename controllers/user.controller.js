const User = require ('../models/user.model');
const http = require ('http');
var passwordHash = require ('password-hash');
var crypto = require ('crypto'); //node module to create hashes
const nodemailer = require ('nodemailer'); //package to allow email functionality
const UserHash = require ('../models/userHash.model');
const College = require ('../models/college.model');
const Token = require ('../models/token.model');
const Post = require ('../models/post.model');

exports.signup = async function (req, res) {
  var existing = await User.findOne ({email: req.body.email});
  if (existing != null) {
    res.send ({msg: 'Email ID already exists'});
    res.status (409); //conflict
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
      user: process.env.SENDER_EMAIL, //configured in .env file
      pass: process.env.SENDER_EMAIL_PASS, //configured in .env file
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
      {isActive: true}, //verifies user
      {new: true},
      async (err, user) => {
        if (err) {
          res
            .status (500)
            .send ({msg: 'Error occured while updating user document'});
        }
        deleteHash (result);
        var token = new Token ({user: result.user_id}); //generate token for session management
        token = await token.save ();
        res.header ('authorization', token._id); //send token as header
        res.status (200).send ({msg: 'Account verified', user: user});
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
          res.status (401);
          res.json ({
            msg: 'Password does not match!',
          });
        }
      } else {
        res.status (401);
        res.json ({msg: 'Please verify your email address'});
      }
    }
  }
};

exports.signout = async function (req, res) {
  var token = await Token.findByIdAndDelete (req.headers['authorization']);
  console.log (token);
  res.status (200).send ({msg: 'Signout success'});
};

exports.signoutall = async function (req, res) {
  var tokens = await Token.deleteMany ({user: req.token.user});
  console.log (tokens);
  res.status (200).send ({message: 'Signout all success'});
};

exports.resetPass = function (req, res) {
  //TODO
};

exports.dashboard = async function (req, res) {
  var user = await User.findById (req.token.user);
  if (!user) {
    res.status (404).send ({message: 'User not found'});
  } else res.status (200).send (user);
};

exports.update = function (req, res) {
  var user = User.findById (req.token.user);
  if (!user) {
    res.status (404).send ({message: 'User not found'});
  } else {
    user.update (req.body, function (err, result) {
      if (err) res.status (401).send ({msg: 'Update Failed'});
      res.status (200).send ({msg: 'User details updated successfully!'});
    });
  }
};

exports.feed = function (req, res) {
  // find all the posts 'postedBy' users having "college_name:token.user.college_name"

  User.findById ({_id: req.token.user})
  .then (current_user => {
    User.find({college_name:current_user.college_name}).select('_id').exec(function(err,userArray){
      if (err) console.log(err)
      //res.send(userArray);
      Post.find({postedBy:{$in:userArray}},function(err,allPosts){
        if (err) res.send(err)
        res.send(allPosts);
      })
    })
  })
  .catch (err => {
    console.log(err);
  });

  // User.find ({college_name: req.token.user.college_name}, function (
  //   err,
  //   result
  // ) {
  //   if (err) console.log (err);
  //   console.log (result);
  // });
};

exports.createpost = async function (req, res) {
  req.body.postedBy = req.token.user;
  Post.create (req.body, function (err, result) {
    if (err) res.status (500).send ({msg: 'Post not created.'});
    res.status (200).send ({msg: 'Post created', post: result});
  });
};

exports.myposts = function (req, res) {
  Post.find ({postedBy: req.token.user}).exec (function (err, records) {
    if (err) res.status (404).send ({msg: 'Posts could not be found!'});
    res.status (200).send ({msg: 'Posts of current user:', posts: records});
  });
};

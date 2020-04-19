const User = require ('../models/user.model');
const http = require ('http');
var passwordHash = require ('password-hash');
var crypto = require ('crypto');
const nodemailer = require ('nodemailer');
const UserHash = require ('../models/userHash.model');
const College = require ('../models/college.model');
const Token = require ('../models/token.model');
const Post = require ('../models/post.model');

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
      console.log (req.body.email);
      console.log (user._id);
      checkCollege (req.body.email, user._id);
      sendEmail (verification_hash, req.body.email);
      res.status (200);
      res.json ({
        msg: 'Account Created Successfully',
        data: user,
      });
    });
  }
};

function checkCollege (email, userid) {
  console.log (email);
  console.log (userid);
  var mail = '';
  mail = email;
  collegeName = mail.slice (mail.indexOf ('@') + 1, mail.length - 4);
  console.log (collegeName);
  College.findOne ({name: collegeName}, async function (err, college) {
    if (err) console.log ('Error finding college');
    if (college == null) {
      College.create ({name: collegeName, students: [userid]}, function (
        err,
        result
      ) {
        if (err) console.log ('Error creating new College');
        console.log ('New college Created');
      });
    } else {
      college.students.push (userid);
      await college.save (function (err, result) {
        if (err) console.log ('Error updating the colllege');
        console.log ('Student Added in existing college');
        console.log ('Student added in already existing college' + result);
      });
    }
  });
}
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
      async (err, user) => {
        if (err) {
          res
            .status (500)
            .send ({msg: 'Error occured while updating user document'});
        }
        deleteHash (result);
        var token = new Token ({user: result.user_id});
        token = await token.save ();
        res.header ('authorization', token._id);
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
      if (user.isActive == 'true') {
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
        res.status (404);
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
  var user = await User.findById (req.token.user).populate ('posts');
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
  //TODO
};

exports.createpost = async function (req, res) {
  let user = {};
  User.findById (req.token.user, function (err, result) {
    if (err) res.status (404).send ({msg: 'User not found.'});
    user = result;
  });
  console.log (user);
  var post = new Post (req.body);
  post = await post.save ();
  console.log ('User is: ' + user + ' and Post is: ' + post);
  user.posts.push (post._id);
  user.save (function (err, result) {
    if (err) res.status (404).send ({msg: 'Post could not be assigned'});
    res.status (200).send ({msg: 'Posts created and assigned successfully'});
  });
  console.log (user);
  // Post.create(req.body,function(err,result){
  //   if (err) console.log ('Error creating new Post');
  //   console.log ('New Post Created');

  //   user.posts.push (result._id);
  //   await user.save (function (err, success) {
  //     if (err)
  //       res
  //         .status (404)
  //         .send ({msg: 'Post created but not assigned to user'});
  //     res.status (200).send ({msg: 'Post created successfully!'});
  //   });
  // })

  // Post.create (req.body)
  //   .then (async result => {
  //     console.log(result);
  //     var user = User.findById (req.token.user);
  //     user.posts.push (result._id);
  //     await user.save (function (err, success) {
  //       if (err)
  //         res
  //           .status (404)
  //           .send ({msg: 'Post created but not assigned to user'});
  //       res.status (200).send ({msg: 'Post created successfully!'});
  //     });
  //   })
  //   .catch (err => {
  //     res.status (401).send ({msg: 'Post could not be created.'});
  //   });

  // var post = new Post (req.body);
  // post = await post.save (async function (err, post) {
  //   if (err) res.status (401).send ({msg: 'Post could not be created.'});
  //   var user = User.findById (req.token.user);
  //   user.posts.push (post._id);
  //   await user.save (function (err, success) {
  //     if (err)
  //       res.status (404).send ({msg: 'Post created but not assigned to user'});
  //     res.status (200).send ({msg: 'Post created successfully!'});
  //   });
  // });
  // assignPost = async () => {
  //   var user = User.findById (req.token.user);
  //   user.posts.push (post._id);
  //   await user.save (function (err, success) {
  //     if (err)
  //       res.status (404).send ({msg: 'Post created but not assigned to user'});
  //     res.status (200).send ({msg: 'Post created successfully!'});
  //   });
  // };
  // assignPost();
};

exports.myposts = function (req, res) {
  User.findById (req.token.user, function (err, result) {
    if (err) res.status (404).send ({msg: 'User not found.'});
    console.log(result);
    Post.find ().where ('_id').in (result.posts).exec (function (err, myPosts) {
      if(err) res.status(404).send({msg:"Posts could not be found!"})
      res.status(200).send({msg:"Posts of current user:",posts:myPosts});
    });
  });
};

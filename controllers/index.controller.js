const http = require ('http');
const User = require ('../models/user.model');
const Token = require ('../models/token.model');

exports.feed = async function (req, res) {
  var promises = [];
  var data = {};
  if (req.cookies.authorization) {
    Token.findById (req.cookies.authorization, function (err, token) {
      if (err) res.status (404).json ({msg: 'Internal Server Error'});
      User.findById (token.user, function (error, newUser) {
        if (newUser != null && newUser.isActive) {
          var userPromise = new Promise ((resolve, reject) => {
            // Create options
            const options = {
              hostname: req.hostname,
              port: 3000,
              path: '/users/',
              method: 'GET',
              headers: {authorization: req.cookies.authorization},
            };

            // Make http request
            const httpReq = http.request (options, httpRes => {
              var buff = '';
              httpRes.on ('data', chunks => {
                buff += chunks;
              });

              httpRes.on ('end', () => {
                if (httpRes.statusCode === 200) {
                  data.user = JSON.parse (buff);
                  resolve ();
                } else {
                  reject (JSON.parse (buff));
                }
              });
            });

            httpReq.on ('error', error => {
              reject (error);
            });

            httpReq.end ();
          });
          promises.push (userPromise);

          var feedPromise = new Promise ((resolve, reject) => {
            // Create options
            const options = {
              hostname: req.hostname,
              port: 3000,
              path: '/users/feed',
              method: 'GET',
              headers: {authorization: req.cookies.authorization},
            };

            // Make http request
            const httpReq = http.request (options, httpRes => {
              var buff = '';
              httpRes.on ('data', chunks => {
                buff += chunks;
              });

              httpRes.on ('end', () => {
                if (httpRes.statusCode === 200) {
                  data.posts = JSON.parse (buff);
                  resolve ();
                } else {
                  reject (JSON.parse (buff));
                }
              });
            });

            httpReq.on ('error', error => {
              reject (error);
            });

            httpReq.end ();
          });

          promises.push (feedPromise);
          Promise.all (promises)
            .then (() => {
              res.render ('feed', {
                title: 'Netowrk Feed',
                pageData: data,
                jsFile: '/javascripts/feed.js',
              });
            })
            .catch (error => {
              console.log (error);
              res.render ('error', error);
            });
        } else res.redirect ('/verificationEmail');
      });
    });
  } else res.redirect ('/');
};

exports.homepage = function (req, res) {
  if (req.cookies.authorization) {
    res.redirect ('http://localhost:3000/feed');
  }
  res.render ('homepage', {
    title: 'The College Network',
    heading: 'Welcome to College Network',
    info: 'A place where you can connect with other students of your university and make new connections that last life long. ' +
      'Get all the happenings and events of your institution right here at the click of a button. ' +
      'Share your educational journey with others and be a part of theirs.',
    jsFile: '/javascripts/homepage.js',
    cssFile:'/stylesheets/homepage.css',
    cta: 'SIGN UP',
    home: true,
  });
};

exports.emailSent = function (req, res) {
  res.render ('homepage', {
    title: 'Verification Mail Sent',
    heading: 'Signed Up Successfully!',
    info: 'Welcome aboard! We have sent you an email with a verification link. Please verify your account by clicking on that link. ' +
      'We are happy to have you with us :)',
    jsFile: '/javascripts/homepage.js',
    cssFile:'/stylesheets/homepage.css',
    cta: 'Resend Verification Email',
    home: false,
  });
};

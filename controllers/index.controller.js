const http = require ('http');

exports.feed = function (req, res) {
  console.log ('Cookies: ', req.cookies);
  var promises = [];
  var data = {};
  if (req.cookies.authorization) {
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
  }

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
      console.log (data);
      res.render ('feed', data);
    })
    .catch (error => {
      console.log (error);
      res.render ('error', error);
    });
};

exports.homepage = function (req, res) {
  if (req.cookies.authorization) {
    res.redirect ('http://localhost:3000/feed');
  }
  res.render ('homepage', {
    heading: 'Welcome to College Network',
    info: 'A place where you can connect with other students of your university and make new connections that last life long. ' +
      'Get all the happenings and events of your institution right here at the click of a button. ' +
      'Share your educational journey with others and be a part of theirs.',
    cta: 'SIGN UP',
    home:'True'
  });
};

exports.emailSent = function (req, res) {
  res.render ('homepage', {
    heading: 'Signed Up Successfully!',
    info:'Welcome aboard! We have sent you an email with a verification link. Please verify your account by clicking on that link.<br>'+
    'We are happy to have you with us :)',
    cta:'Verification Email Sent',
    home:'False'
  });
};

const http = require ('http');

exports.homePage = function (req, res) {
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

exports.signupPage = function (req,res)
{
  res.render('signup');
}

exports.signinPage = function (req,res)
{
  res.render('signin');
}
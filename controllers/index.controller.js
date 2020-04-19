const http = require ('http');

exports.homePage = function (req, res) {
  res.render('index', { title: 'Express' });
};

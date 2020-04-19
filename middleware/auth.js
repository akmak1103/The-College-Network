const Token = require ('../models/token.model');
module.exports = async function (req, res, next) {
  const token_id = req.headers['authorization'];
  if (!token_id) {
    // 401 : Unauthorized
    return res.status (401).send ({msg: 'No token provided'});
  }

  console.log ('Token (Auth.js): ' + token_id);
  var token = await Token.findById (token_id);
  if (!token) {
    // 403 : Forbidden
    return res.status (403).send ({msg: 'Invalid token'});
  }
  req.token = token;
  next ();
};
const http = require ('http');
const Post = require ('../models/post.model');

exports.like = function (req, res) {
  Post.findById (req.params.id).exec (function (err, post) {
    if (err) res.status (404).send (err);
    post.update ({likes: post.likes + 1}).exec (function (err, liked) {
      if (err) res.status (500).send (err);
      res.status (200).send ({msg:"Liked"});
    });
  });
};

exports.comment = function (req, res) {
  //TODO
};

exports.share = function (req, res) {
  //TODO
};

exports.save = function (req, res) {
  //TODO
};

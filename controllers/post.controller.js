const http = require ('http');
const Post = require ('../models/post.model');
const User = require ('../models/user.model');

exports.like = function (req, res) {
  Post.findById (req.params.id).exec (function (err, post) {
    if (err) res.status (404).send (err);
    //update the 'likes' field of fetched
    post.update ({likes: post.likes + 1}).exec (function (err, liked) {
      if (err) res.status (500).send (err);
      res.status (200).send ({msg: 'Liked'});
    });
  });
};

exports.comment = function (req, res) {
  Post.findById (req.params.id).exec (async function (err, post) {
    if (err) res.status (404).send (err);
    post.comments.push ({author: req.token.user, data: req.body.commentData});     //push the new comment document in comments array of the post
    await post.save (function (err, result) {
      if (err) res.status (500).send (err);
      res.status (200).send ({msg: 'Comment posted'});
    });
  });
};

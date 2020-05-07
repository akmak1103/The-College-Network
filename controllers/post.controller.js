const http = require ('http');
const Post = require ('../models/post.model');
const User = require ('../models/user.model');

var liked = true;

//like post if not already liked
exports.like = async function (req, res) {
  var postId = req.params.id;
  var userId = req.token.user;
  await User.findById (userId)
    .exec ()
    .then (result => {
      var alreadyLikedPosts = result.likedPosts;
      liked = alreadyLikedPosts.includes (postId);
    })
    .catch (err => {
      console.log("Some Error occured")
    });
  if (liked) res.status (401).send ({msg: 'Already liked!'});
  else {
    await Post.findById (req.params.id).exec (function (err, post) {
      if (err) res.status (404).send (err);
      //update the 'likes' field of fetched
      post.updateOne ({likes: post.likes + 1}).exec (function (err, liked) {
        if (err) res.status (500).send (err);
        mapLikeToUser (postId, userId);
        res.status (200).send({msg:"Post liked successfully"});
      });
    });
  }
};

//add liked post to user's data
function mapLikeToUser (postId, userId) {
  User.findById (userId, async function (err, user) {
    user.likedPosts.push (postId); //push the id of post in likedPosts array
    await user.save (function (err, result) {
      if (err) res.status (500).send (err);
    });
  });
}

//comment on post
exports.comment = function (req, res) {
  Post.findById (req.params.id).exec (async function (err, post) {
    if (err) res.status (404).send (err);
    post.comments.push ({author: req.token.user, data: req.body.commentData}); //push the new comment document in comments array of the post
    await post.save (function (err, result) {
      if (err) res.status (500).send (err);
      res.status (200).send ({msg: 'Comment posted'});
    });
  });
};

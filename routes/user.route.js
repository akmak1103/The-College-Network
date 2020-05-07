const express = require ('express');
const router = express.Router ();
const user_controller = require ('../controllers/user.controller');
const auth = require ('../middleware/auth');
var multer = require ('multer');

//set image storage options
var storage = multer.diskStorage ({
  destination: function (req, file, cb) {
    cb (null, './public/upload');
  },
  filename: function (req, file, cb) {
    var filetype = '';
    if (file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if (file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if (file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    cb (null, 'image-' + Date.now () + '.' + filetype);
  },
});

var upload = multer ({storage: storage});

router.post ('/signup', user_controller.signup);

router.get ('/verify/:hash', user_controller.verifyUser);

router.post ('/resendEmail', user_controller.resendEmail);

router.post ('/signin', user_controller.signin);

router.post ('/signout', auth, user_controller.signout);

router.post ('/signoutall', auth, user_controller.signoutall);

router.post ('/changePassword', auth, user_controller.changePass);

router.post ('/resetPass', user_controller.resetPass);

router.get ('/', auth, user_controller.dashboard);

router.post (
  '/updatePic',
  auth,
  upload.single ('user_pic'),
  user_controller.updatePhoto
);

router.post (
  '/postPhoto',
  auth,
  upload.single ('image'),
  user_controller.postPhoto
);

router.get ('/feed', auth, user_controller.feed);

module.exports = router;

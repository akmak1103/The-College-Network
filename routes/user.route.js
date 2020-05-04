const express = require ('express');
const router = express.Router ();
const user_controller = require ('../controllers/user.controller');
const auth = require ('../middleware/auth');
var multer = require("multer")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/upload')
    },
    filename: function (req, file, cb) {
        var filetype = ''
        if (file.mimetype === 'image/gif') {
            filetype = 'gif'
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png'
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg'
        }
        cb(null, 'image-' + Date.now() + '.' + filetype)
    }
})

var upload = multer({ storage: storage })

router.post ('/signup', user_controller.signup); //working

router.get ('/verify/:hash', user_controller.verifyUser); //working

router.post ('/resendVerifyEmail', user_controller.resendVerifyEmail); //working

router.post ('/resendEmail', user_controller.resendEmail); //working

router.post ('/signin', user_controller.signin); //working

router.post ('/signout', auth, user_controller.signout); //working

router.post ('/signoutall', auth, user_controller.signoutall); //working

router.post ('/changePassword', auth, user_controller.changePass); //working

router.post ('/resetPass', user_controller.resetPass); //working

router.get ('/', auth, user_controller.dashboard); //working

router.post ('/', auth,upload.single('user_pic'), user_controller.update); //working

router.get ('/feed', auth, user_controller.feed); //working

router.post ('/post', auth, user_controller.createpost); //working

router.get ('/post', auth, user_controller.myposts); //working

module.exports = router;

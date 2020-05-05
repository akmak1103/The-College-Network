function validateChangePassword () {
  if (!($ ('#old-pass').val ().length > 7)) {
    $ ('#label-old-pass')
      .css ('color', 'red')
      .text ('Please enter your password of min. 8 characters.');
    $ ('#old-pass').focus ();
    return false;
  } else $ ('#label-old-pass').css ('color', 'green').text ('Old password');
  var passReg = new RegExp ('[0-9]');
  if (
    !passReg.test ($ ('#new-pass').val ()) ||
    !($ ('#new-pass').val ().length > 7)
  ) {
    $ ('#label-new-pass')
      .css ('color', 'red')
      .text ('Minimum 8 characters with at least 1 digit');
    $ ('#new-pass').focus ();
    return false;
  } else $ ('#label-new-pass').css ('color', 'green').text ('New password');
  if ($ ('#old-pass').val () == $ ('#new-pass').val ()) {
    $ ('#label-new-pass')
      .css ('color', 'red')
      .text ('Please set a new password');
    $ ('#new-pass').focus ();
    return false;
  } else $ ('#label-new-pass').css ('color', 'green').text ('New password');
  if (!($ ('#new-pass').val () == $ ('#new-pass-2').val ())) {
    $ ('#label-new-pass-2')
      .css ('color', 'red')
      .text ('Confirm password does not match.');
    $ ('#new-pass-2').focus ();
    return false;
  } else
    $ ('#label-new-pass-2').css ('color', 'green').text ('Confirm password');
  console.log ('Ready for server request.');
  changePass ();
}

function changePass () {
  $.ajax ('/users/changePassword', {
    type: 'POST',
    headers: {authorization: getCookie ('authorization')},
    data: {
      old_password: $ ('#old-pass').val (),
      new_password: $ ('#new-pass').val (),
    },
    success: function (data, status) {
      $ ('#changePassModal').modal ('hide');
      $ ('#change-pass-error').text (data.msg);
      toastr.options = {
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
        preventDuplicates: false,
        onclick: null,
        showDuration: 1,
        hideDuration: 1000,
        timeOut: 1000,
        extendedTimeOut: 1000,
        showEasing: 'swing',
        hideEasing: 'linear',
        showMethod: 'fadeIn',
        hideMethod: 'fadeOut',
      };
      toastr.success ('<i class="fas fa-check-double"></i> Password successfully changed!');
    },
    error: function (jqXhr, textStatus, errorMessage) {
      $ ('#change-pass-error').text ('Error ' + errorMessage);
    },
  });
}

// function getCookie (c_name) {
//   if (document.cookie.length > 0) {
//     c_start = document.cookie.indexOf (c_name + '=');
//     if (c_start != -1) {
//       c_start = c_start + c_name.length + 1;
//       c_end = document.cookie.indexOf (';', c_start);
//       if (c_end == -1) c_end = document.cookie.length;
//       return unescape (document.cookie.substring (c_start, c_end));
//     }
//   }
//   return '';
// }
function signOut () {
  var xmlHttpRequest = new XMLHttpRequest ();
  xmlHttpRequest.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        console.log ('signout success');
        window.location = '/';
      } else {
        document.getElementById ('error').innerText = JSON.parse (
          this.responseText
        ).message;
      }
    }
  };
  xmlHttpRequest.open ('POST', '/users/signout', true);
  xmlHttpRequest.setRequestHeader ('Content-Type', 'application/json');
  xmlHttpRequest.setRequestHeader (
    'authorization',
    getCookie ('authorization')
  );
  document.cookie = 'authorization=; expires = Thu, 01 Jan 1970 00:00:00 GMT';
  xmlHttpRequest.send ();
  document.getElementById ('signout_Msg').innerText = JSON.parse (
    this.responseText
  ).message;
}

function getCookie (cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent (document.cookie);
  var ca = decodedCookie.split (';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt (0) == ' ') {
      c = c.substring (1);
    }
    if (c.indexOf (name) == 0) {
      return c.substring (name.length, c.length);
    }
  }
  return '';
}

function getUrlVars () {
  var vars = {};
  var parts = window.location.href.replace (
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
    }
  );
  return vars;
}

function likePost (postID, index) {
  $.ajax ('/post/like/' + postID, {
    type: 'PUT',
    headers: {authorization: getCookie ('authorization')},
    success: function (data, status) {
      toastr.options = {
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
        preventDuplicates: false,
        onclick: null,
        showDuration: 1,
        hideDuration: 1000,
        timeOut: 1000,
        extendedTimeOut: 1000,
        showEasing: 'swing',
        hideEasing: 'linear',
        showMethod: 'fadeIn',
        hideMethod: 'fadeOut',
      };
      toastr.info ('<i class="far fa-thumbs-up"></i> Liked Post');
    },
    error: function (jqXhr, textStatus, errorMessage) {
      console.log (data.msg);
    },
  });
  var likes = Number ($ ('#likes' + index).text ());
  likes = likes + 1;
  $ ('#likes' + index).text (likes);
  $ ('#likebutton' + index).removeAttr ('onclick');
  $ ('#likebutton' + index).removeClass("btn-outline-danger");
}

function updateProfile () {
  if ($ ('#user_pic').val ()) {
    updatePhoto ();
  }
  $.ajax ('/users/', {
    type: 'POST',
    headers: {authorization: getCookie ('authorization')},
    data: {
      name: $ ('#user_name').val (),
      gender: $ ('#user_gender').val (),
      contact_number: $ ('#user_contact').val (),
      graducation_year: $ ('#user_gradYear').val (),
    },
    success: function (data, status) {
      $ ('#updateModal').modal ('hide');
      toastr.options = {
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
        preventDuplicates: false,
        onclick: null,
        showDuration: 1,
        hideDuration: 1000,
        timeOut: 1000,
        extendedTimeOut: 1000,
        showEasing: 'swing',
        hideEasing: 'linear',
        showMethod: 'fadeIn',
        hideMethod: 'fadeOut',
      };
      toastr.success ('<i class="fas fa-check-double"></i> Profile Updated!');
      setTimeout ('window.location.reload ();', 2000);
    },
    error: function (jqXhr, textStatus, errorMessage) {
      $ ('#update-error').text ('Error ' + errorMessage);
    },
  });
}

async function updatePhoto () {
  console.log ('Inside update photo');
  var fd = new FormData ();
  var image = $ ('#user_pic')[0].files[0];
  fd.append ('user_pic', image);
  await $.ajax ('/users/updatePic', {
    type: 'POST',
    contentType: false,
    processData: false,
    headers: {authorization: getCookie ('authorization')},
    data: fd,
    success: function (data, status) {
      window.location.reload ();
    },
    error: function (jqXhr, textStatus, errorMessage) {
      $ ('#update-error').text ('Error ' + errorMessage);
    },
  });
}

window.onload = function () {
  var newUser = getUrlVars ()['newUser'];
  if (newUser) {
    $ ('#verifiedModal').modal ('show');
  }
};

function validateRegistration () {
  if ($ ('#name').val () == '') {
    $ ('#invalid-name').css ('color', 'red');
    $ ('#invalid-name').text ('Please enter a value');
    $ ('#name').focus ();
    return false;
  } else $ ('#invalid-name').css ('color', 'green');
  var email = $ ('#r_email').val ();
  atpos = email.indexOf ('@');
  dotpos = email.lastIndexOf ('.');
  if (atpos < 1 || dotpos - atpos < 2) {
    $ ('#invalid-email').css ('color', 'red');
    $ ('#invalid-email').text ('Please enter a valid email');
    $ ('#r_email').focus ();
    return false;
  } else $ ('#invalid-email').css ('color', 'green');
  var passReg = new RegExp ('[0-9]');
  if (
    !passReg.test ($ ('#r_password').val ()) ||
    !($ ('#r_password').val ().length > 7)
  ) {
    $ ('#invalid-pass').css ('color', 'red');
    $ ('#invalid-pass').text ('Minimum 8 characters with at least 1 digit');
    $ ('#r_password').focus ();
    return false;
  } else $ ('#invalid-pass').css ('color', 'green');
  register ();
}

function validateLogin () {
  var email = $ ('#email').val ();
  atpos = email.indexOf ('@');
  dotpos = email.lastIndexOf ('.');
  if (atpos < 1 || dotpos - atpos < 2) {
    $ ('#invalid-login-email').css ('color', 'red');
    $ ('#invalid-login-email').text ('Please enter a valid email');
    $ ('#email').focus ();
    return false;
  } else $ ('#invalid-login-email').css ('color', 'green');
  if (!($ ('#password').val ().length > 7)) {
    $ ('#invalid-login-pass').css ('color', 'red');
    $ ('#invalid-login-pass').text (
      'Please enter your password of min. 8 characters'
    );
    $ ('#password').focus ();
    return false;
  } else $ ('#invalid-login-pass').css ('color', 'green');
  signIn ();
}

function validateResendEmail () {
  var email = $ ('#registeredEmail').val ();
  atpos = email.indexOf ('@');
  dotpos = email.lastIndexOf ('.');
  if (atpos < 1 || dotpos - atpos < 2) {
    console.log ('inside if');
    $ ('#label-resendEmail').css ('color', 'red');
    $ ('#label-resendEmail').text ('Please enter a valid email');
    $ ('#registeredEmail').focus ();
    return false;
  } else $ ('#label-resendEmail').css ('color', 'green');
  resendEmail ();
}

function resendEmail () {
  $.ajax ('/users/resendVerifyEmail', {
    type: 'POST',
    data: {email: $ ('#registeredEmail').val ()},
    success: function (data, status, jqXhr) {
      $ ('#resend-error').text (data.msg);
      document.cookie =
        'authorization=' + jqXhr.getResponseHeader ('authorization');
    },
    error: function (jqXhr, textStatus, errorMessage) {
      $ ('#resend-error').text ('Error ' + errorMessage);
    },
  });
}

function resendemail () {
  console.log ('This is other function.');
  $.ajax ('/users/resendEmail', {
    type: 'POST',
    success: function (data, status, jqXhr) {
      $ ('#resend-msg').text (data.msg);
      document.cookie =
        'authorization=' + jqXhr.getResponseHeader ('authorization');
    },
    error: function (jqXhr, textStatus, errorMessage) {
      $ ('#resend-msg').text ('Error ' + errorMessage);
    },
  });
}

function signIn () {
  var email = document.getElementById ('email').value;
  var password = document.getElementById ('password').value;
  var xmlHttpRequest = new XMLHttpRequest ();
  xmlHttpRequest.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        document.cookie =
          'authorization=' + this.getResponseHeader ('authorization');
        console.log ('Signin successful!');
        window.location = '/feed';
      } else {
        document.getElementById ('error').innerText = JSON.parse (
          this.responseText
        ).msg;
      }
    }
  };
  xmlHttpRequest.open ('POST', '/users/signin', true);
  console.log ('Request Made');
  xmlHttpRequest.setRequestHeader ('Content-Type', 'application/json');
  xmlHttpRequest.send (JSON.stringify ({email: email, password: password}));
}

function register () {
  var name = document.getElementById ('name').value;
  var email = document.getElementById ('r_email').value;
  var password = document.getElementById ('r_password').value;
  var xmlHttpRequest = new XMLHttpRequest ();
  xmlHttpRequest.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        document.cookie =
          'authorization=' + this.getResponseHeader ('authorization');
        window.location = '/verificationEmail';
      } else {
        document.getElementById ('r_error').innerText = JSON.parse (
          this.responseText
        ).msg;
      }
    }
  };
  xmlHttpRequest.open ('POST', '/users/signup', true);
  xmlHttpRequest.setRequestHeader ('Content-Type', 'application/json');
  xmlHttpRequest.send (
    JSON.stringify ({name: name, email: email, password: password})
  );
}

function passModal () {
  $ ('#modalLoginForm').modal ('hide');
  $ ('#resetPass').modal ('show');
}

function validateResetEmail () {
  var email = $ ('#regMail').val ();
  atpos = email.indexOf ('@');
  dotpos = email.lastIndexOf ('.');
  if (atpos < 1 || dotpos - atpos < 2) {
    $ ('#label-regMail').css ('color', 'red');
    $ ('#label-regMail').text ('Please enter a valid email');
    $ ('#regMail').focus ();
    return false;
  } else $ ('#label-regMail').css ('color', 'green');
  resetPassword ();
}

function resetPassword () {
  $.ajax ('/users/resetPass', {
    type: 'POST',
    data: {email: $ ('#regMail').val ()},
    success: function (data, status, jqXhr) {
      $ ('#reset-error').text (data.msg);
    },
    error: function (jqXhr, textStatus, errorMessage) {
      $ ('#reset-error').text ('Error ' + errorMessage);
    },
  });
}

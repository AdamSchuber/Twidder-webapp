displayView = function() {
    // the code required to display a view
    let rootBody = document.getElementById('body');
    let welcomeView = document.getElementById("welcome-view");
    let profileView = document.getElementById("profile-view");

    if (window.localStorage.getItem("token")) {
        rootBody.innerHTML = profileView.innerHTML; 
    }
    else {
        rootBody.innerHTML = welcomeView.innerHTML;
    }
}

window.onload = function() {
    // code is executed as the page is loaded.
    displayView();
}

function handleLogin() {
    // code is executed when submitting login info

    // input from form
    let email = document.forms["login-form"]["email"].value;
    let passwd = document.forms["login-form"]["password"].value;

    // error-handling

    // server-side signin
    let { success, message, data } = serverstub.signin(email, passwd);
    
    // if successful add data as token
    if (data) {
        window.localStorage.setItem("token", data);
        displayView();
    }
}

function handleSubmit() {
    // code is executed when submitting signup info

    // input from form
    let userData = {
        'email': document.form["singup-form"]["email"].value,
        'password': document.forms["signup-form"]["password"].value,
        'firstname': document.forms["singup-form"]["f-name"].value,
        'familyname': document.forms["signup-form"]["s-name"].value,
        'gender': document.forms["singup-form"]["gender"].value,
        'city': document.forms["singup-form"]["city"].value,
        'country': document.forms["singup-form"]["country"].value
    }

    // error handling
    
    // server-side signup
    let {success, message} = serverstub.signUp(userData);
}

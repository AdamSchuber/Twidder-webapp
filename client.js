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

    // rootBody.innerHTML = profileView.innerHTML; 
}

window.onload = function() {
    // code is executed as the page is loaded.
    displayView();
}

function handleLogin(formData) {
    // code is executed when submitting login info
    // input from form
    let email = formData.login_email.value;
    let password = formData.login_password.value;

    // error-handling

    // server-side signin
    let { success, message} = serverstub.signIn(email, password);

    // display message
    Console.log(message);
    displayView();
}

function handleSubmit(formData) {
    // code is executed when submitting signup info
    // input from form
    let userData = {
        'email': formData.email.value,
        'password': formData.password.value,
        'firstname': formData.first.value,
        'familyname': formData.second.value,
        'gender': formData.gender.value,
        'city': formData.city.value,
        'country': formData.country.value
    }

    // server-side signup
    let {success, message} = serverstub.signUp(userData);

    window.alert(message);
}

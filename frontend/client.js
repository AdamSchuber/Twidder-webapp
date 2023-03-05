displayView = function() {
    // the code required to display a view
    let rootBody = document.getElementById('body');
    let welcomeView = document.getElementById("welcome-view");
    let profileView = document.getElementById("profile-view");

    if (window.localStorage.getItem("token")) {
        rootBody.innerHTML = profileView.innerHTML; 
        tabSwitch("home")
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
    let { success, message, data} = serverstub.signIn(email, password);

    // display message

    // set data as token, change view
    window.localStorage.setItem("token", data);
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

    // validate password likeness
    if (userData["password"] != userData["repeat-password"]) {
        return false;
    }

    // validate password length
    if (userData["password"].length < 5) {
        return false;
    }

    // server-side signup
    let {success, message} = serverstub.signUp(userData);

    window.alert(message);
}

function postMessage(formData) {

}

function refreshMessageBoard() {

}

function displayInfo() {
    // let { success, message, data } = serverstub.getUserDataByToken(window.localStorage.getItem("token"));
    // let infoDiv = document.getElementById("info");

    // let html = "";
    // Object.keys(data).map(key => {
    //     html += "<div class='info-pair'>";
    //     html += "<p>" + key + ": " + data[key] + "<p/>";
    // });

    // infoDiv.innerhtml = html;
    
    // return false;
}

function tabSwitch(tab) {
    document.getElementById("home").style.display = "none";
    document.getElementById("browse").style.display = "none";
    document.getElementById("account").style.display = "none";
    document.getElementById(tab).style.display = "flex";
    displayInfo();
    refreshMessageBoard();
}

function logOut() {
    let { success, message } = serverstub.signOut(window.localStorage.getItem("token"));
    localStorage.removeItem("token");
    displayView();
}
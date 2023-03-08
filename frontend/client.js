// the code required to display a view
displayView = function() {
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
}

// code is executed as the page is loaded.
window.onload = function() {
    displayView();
}

// code is executed when submitting login info
function handleLogin(formData) {
    let errorDiv = document.getElementById("login-error");

    // input from form
    let email = formData.login_email.value;
    let password = formData.login_password.value;

    // server-side signin
    let { success, message, data} = serverstub.signIn(email, password);

    // display message
    if (!success) {
        errorDiv.innerHTML = message;
        return false;
    }

    // set data as token, change view
    window.localStorage.setItem("token", data);
    displayView();
}

// code is executed when submitting signup info
function handleSignUp(formData) {
    let errorDiv = document.getElementById("signup-error");

    console.log("form submitted:", formData);

    let password = formData.password.value;
    let repeat = formData.repeat.value;
    
    errorDiv.innnerHTML = validatePassword(password, repeat)
    
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
    
    console.log("form data:", userData);
    
    // server-side signup
    let {success, message} = serverstub.signUp(userData);
    if (!success) {
        errorDiv.innerHTML = message;
        return false;
    }
    console.log("signup successful!");
}

// switches tabsS
function tabSwitch(tab) {
    if (tab == "browse") {
        document.getElementById("user-info").innerHTML = "";
        document.getElementById("user-feed").innerHTML = "";
    }

    document.getElementById("home").style.display = "none";
    document.getElementById("browse").style.display = "none";
    document.getElementById("account").style.display = "none";
    document.getElementById(tab).style.display = "flex";
    displayInfo();
    refreshMessageBoard();
}

// logs user out
function logOut() {
    let { success, message } = serverstub.signOut(window.localStorage.getItem("token"));
    window.localStorage.removeItem("token");
    displayView();
}

// posts a message to db
function postMessage(formData) {
    // save message box content and clear
    let post = formData.message_box.value;
    formData.message_box.value = "";
    
    // save post in db
    let { success, message } = serverstub.postMessage(window.localStorage.getItem("token"), post, null);
    refreshMessageBoard();
    return false;
}

function postMessageToUser(formData) {
    let post = formData.message_user_box.value;
    let email = formData.user_box.value;
    errorDiv = document.getElementById("browse-message");
    
    let { success, message } = serverstub.postMessage(window.localStorage.getItem("token"), post, email);
    if (!success) {
        errorDiv.innerHTML = message;
    }
    return false;
}

// refreshes messages board with new messages from db
function refreshMessageBoard() {
    let { success, message, data } = serverstub.getUserMessagesByToken(window.localStorage.getItem("token"))
    let messagesDiv = document.getElementById("feed");

    let messagesHTML = "";
    let iter = 1;
    for (let key in data) {
        for (let key2 in data[key]) {
            if (iter == 1) {
                messagesHTML += "<div class='messages-pair'>";
            }
            messagesHTML += "<p>" + data[key][key2] + "</p>";
            if (iter == 2) {
                messagesHTML += "</div>";
                iter = 0;
            }
            iter = iter + 1;
        }
    }

    messagesDiv.innerHTML = messagesHTML;
    return false;
}

// displays personal info on info wall
function displayInfo() {
    let { success, message, data } = serverstub.getUserDataByToken(window.localStorage.getItem("token"));
    let infoDiv = document.getElementById("info");

    let infoHTML = "";
    for (let key in data) {
        infoHTML += "<div class='info-pair'>";
        infoHTML += "<p>" + key + ": " + data[key] + "</p>";
        infoHTML += "</div>";    
    }

    infoDiv.innerHTML = infoHTML;
    return false;
}

function getUserProfile(formData) {
    let email = formData.user_box.value;
    let errorDiv = document.getElementById("browse-message");
    let infoDiv = document.getElementById("user-info");
    infoDiv.innerHTML = "";

    let { success, message, data } = serverstub.getUserDataByEmail(window.localStorage.getItem("token"), email);
    if (!success) {
        errorDiv.innerHTML = message;
        return false;
    }

    let infoHTML = "";
    for (let key in data) {
        infoHTML += "<div class='info-pair'>";
        infoHTML += "<p>" + key + ": " + data[key] + "</p>";
        infoHTML += "</div>";    
    }

    infoDiv.innerHTML = infoHTML;
    errorDiv.innnerHTML = "";
    getUserMessageWall(formData);
    return false;
}

function getUserMessageWall(formData) {
    let email = formData.user_box.value;
    let errorDiv = document.getElementById("browse-message");
    let userFeedDiv = document.getElementById("user-feed");
    userFeedDiv.innerHTML = "";

    let { success, message, data } = serverstub.getUserMessagesByEmail(window.localStorage.getItem("token"), email);
    if (!success) {
        errorDiv.innerHTML = message;
    }
    
    console.log(data);

    let messagesHTML = "";
    let iter = 1;
    for (let key in data) {
        for (let key2 in data[key]) {
            if (iter == 1) {
                messagesHTML += "<div class='messages-pair'>";
            }
            messagesHTML += "<p>" + data[key][key2] + "</p>";
            if (iter == 2) {
                messagesHTML += "</div>";
                iter = 0;
            }
            iter = iter + 1;
        }
    }

    userFeedDiv.innerHTML =  messagesHTML;
    errorDiv = "";
    return false;
}

function handleChangePassword(formData) {
    let errorDiv = document.getElementById("account-message");
    let oldPassword = formData.old_password.value;
    let newPassword = formData.new_password.value;
    let newRepeat = formData.repeat_new.value;

    errorDiv = validatePassword(newPassword, newRepeat);
    
    let { success, message } = serverstub.changePassword(window.localStorage.getItem("token"), oldPassword, newPassword);
    console.log(message);
    errorDiv.innerHTML = message;
}

// validates password, returns error string
function validatePassword(password, repeat) {
    // validate password likeness
    if (password != repeat) {
        return "Passwords are different!";
    }
    
    // validate password length
    if (password.length < 5) {
        return "Password too short! Minimum length is 5 characters";
    }

    return "";
}
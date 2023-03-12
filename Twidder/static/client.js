
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
    errorDiv.innerHTML = "";
    // input from form
    let email = formData.login_email.value;
    let password = formData.login_password.value;
    let request = new XMLHttpRequest();
    // send request
    request.open("POST", "/sign-in", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({"email": email, "password": password}));
    // send request to server
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // console.log("login success");
            window.localStorage.setItem("token", this.responseText);
            displayView();
        }
        else {
            errorDiv.innerHTML = "Wrong email or password";
        }
    }
}

// code is executed when submitting signup info
function handleSignUp(formData) {
    let errorDiv = document.getElementById("signup-error");
    errorDiv.innerHTML = "";
    // input from form
    let password = formData.password.value;
    let repeat = formData.repeat.value;
    // validate password
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
    let request = new XMLHttpRequest();
    // send request
    request.open("POST", "/sign-up", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(userData));
    // send request to server
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            errorDiv.innerHTML = "Account created";
        }
        else {
            if (this.status == 400) {
                errorDiv.innerHTML = "Data is invalid";
            }
            else if (this.status == 409) {
                errorDiv.innerHTML = "User already exists";
            }
            else if (this.status == 404) {
                errorDiv.innerHTML = "Account creation failed";
            }  
        }
    }
}

// switches tabs
function tabSwitch(tab) {
    if (tab == "browse") {
        document.getElementById("user-info").innerHTML = "";
        document.getElementById("user-feed").innerHTML = "";
    }
    else if (tab == "home") {
        displayInfo();
        refreshMessageBoard();
    }

    if (window.localStorage.getItem("currentUser") != null) {
        window.localStorage.removeItem("currentUser");
    }

    // hide all tabs
    document.getElementById("home").style.display = "none";
    document.getElementById("browse").style.display = "none";
    document.getElementById("account").style.display = "none";
    document.getElementById(tab).style.display = "flex";
    console.log("tab switched to " + tab);
}

// logs user out
function logOut() {
    let request = new XMLHttpRequest();
    // send request
    request.open("POST", "/sign-out", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.setRequestHeader("Authorization", localStorage.getItem('token'));
    request.send();
    // request to server
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.localStorage.removeItem("token");
            if (window.localStorage.getItem("currentUser") != null) {
                window.localStorage.removeItem("currentUser");
            }
            displayView();
        }
    }
}

function handleChangePassword(formData) {
    let errorDiv = document.getElementById("account-message");
    let oldPassword = formData.old_password.value;
    let newPassword = formData.new_password.value;
    let newRepeat = formData.repeat_new.value;
    errorDiv = validatePassword(newPassword, newRepeat);
    
    if (errorDiv.innerHTML != "") {
        let request = new XMLHttpRequest();
        // send request
        request.open("POST", "/change-password", true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.setRequestHeader("Authorization", localStorage.getItem('token'));
        request.send(JSON.stringify({"oldPassword": oldPassword, "newPassword": newPassword}));
        // request to server
        request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                errorDiv.innerHTML = "Password changed";
            }
            else if (this.status == 401) {
                errorDiv.innerHTML = "User not logged in";
            }
            else if (this.status == 403) {
                errorDiv.innerHTML = "Wrong password or user dont exist";
            }
            else if (this.status == 404) {
                errorDiv.innerHTML = "Password too short";
            }
        }
    }
}

// posts a message to db
function postMessage(formData) {
    // save message box content and clear
    let post = formData.message_box.value;
    formData.message_box.value = "";
    let messagesDiv = document.getElementById("feed");
    messagesDiv = "";

    request = new XMLHttpRequest();
    // send request
    request.open("POST", "/post-message", true);
    request.setRequestHeader("Content-Type", "application/json", "charset=UTF-8");
    request.setRequestHeader("Authorization", window.localStorage.getItem("token"));
    request.send(JSON.stringify({"message": post}));
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
                getUserMessageWall();
        }
        else if (this.status == 401) {
            messagesDiv.innerHTML = "User not logged in";
        }
        else if (this.status == 404) {
            messagesDiv.innerHTML = "User not found";
        }
    }
}

function postMessageToUser(formData) {
    // save message box content and clear
    let post = formData.message_user_box.value;
    formData.message_user_box.value = "";
    let errorDiv = document.getElementById("user-feed");
    errorDiv = "";

    let email = window.localStorage.getItem("currentUser");
    if (email == null) {
        errorDiv.innerHTML = "No user selected";
    }

    let request = new XMLHttpRequest();
    // send request
    request.open("POST", "/post-message", true);
    request.setRequestHeader("Content-Type", "application/json", "charset=UTF-8");
    request.setRequestHeader("Authorization", window.localStorage.getItem("token"));
    request.send(JSON.stringify({"message": post, "email": email}));
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
                refreshMessageBoard(email);
                console.log("message posted");
        }
        else if (this.status == 401) {
            errorDiv.innerHTML = "User not logged in";
        }
        else if (this.status == 404) {
            errorDiv.innerHTML = "User not found";
        }
    }
    if (email != null) {
        getUserMessageWall(email);
    }
}

// refreshes messages board with new messages from db
function refreshMessageBoard() {
    let messagesDiv = document.getElementById("feed");
    let request = new XMLHttpRequest();
    // send request
    request.open("GET", "/get-user-messages-by-token", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.setRequestHeader("Authorization", localStorage.getItem('token'));
    request.send();
    // request to server
    request.onreadystatechange = function() {
        let messagesHTML = "";
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(this.responseText);
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                messagesHTML += "<div class='messages-pair'>";
                messagesHTML += "<p>" + data[data.length - i - 1][0] + "</p>";
                messagesHTML += "<p>" + data[data.length - i - 1][2] + "</p>";
                messagesHTML += "</div>";
            }
        }
        else if (this.status == 403) {
            messagesHTML = "messages not found";
        }
        else if (this.status == 404) {
            messagesHTML = "User not found";
        }
        else {
            messagesHTML = "No messages";
        }
        messagesDiv.innerHTML = messagesHTML;
    }  
}

// displays personal info on info wall
function displayInfo() {
    let infoDiv = document.getElementById("info");
    let  infoHeaders = {
        '0': 'email',
        '1': 'firstname',
        '2': 'familyname',
        '3': 'gender',
        '4': 'city',
        '5': 'country'
    } 
    let request = new XMLHttpRequest();
    // send request
    request.open("GET", "/get-user-data-by-token", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.setRequestHeader("Authorization", localStorage.getItem('token'));
    request.send();
    // request to server
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("loading info...")
            let response = JSON.parse(this.responseText);
            let infoHTML = "";
            for (let i = 0; i < 6; i++) {
                if (response[i] == "password") {
                    continue;
                }
                infoHTML += "<div class='info-pair'>";
                infoHTML += "<p>" + infoHeaders[i] + ": " + response[i] + "</p>";
                infoHTML += "</div>";    
            }
            infoDiv.innerHTML = infoHTML;
        }
        else if (this.status == 401) {
            infoDiv.innerHTML = "User not logged in";
        }
        else if (this.status == 404) {
            infoDiv.innerHTML = "User not found";
        }
    }  
}

function getUserProfile(formData) {
    let email = formData.user_box.value;
    let infoDiv = document.getElementById("user-info");
    infoDiv.innerHTML = "";
    let  infoHeaders = {
        '0': 'email',
        '1': 'firstname',
        '2': 'familyname',
        '3': 'gender',
        '4': 'city',
        '5': 'country'
    } 
    let request = new XMLHttpRequest();
    // send request
    request.open("GET", "/get-user-data-by-email", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.setRequestHeader("Email", email);
    request.send();
    // request to server
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("retreiving user info...")
            let response = JSON.parse(this.responseText);
            let infoHTML = "";
            for (let i = 0; i < 6; i++) {
                if (response[i] == "password") {
                    continue;
                }
                infoHTML += "<div class='info-pair'>";
                infoHTML += "<p>" + infoHeaders[i] + ": " + response[i] + "</p>";
                infoHTML += "</div>";
            }
            infoDiv.innerHTML = infoHTML;
            if (window.localStorage.getItem("currentUser") == null) {
                window.localStorage.setItem("currentUser", response[0]);
            }
            else {
                window.localStorage.removeItem("currentUser");
                window.localStorage.setItem("currentUser", response[0]);
            }
        }
        else if (this.status == 404) {
            info.innerHTML = "User not found";
        }
    }
    getUserMessageWall(email);
}

function getUserMessageWall(email) {
    let userFeedDiv = document.getElementById("user-feed");
    userFeedDiv.innerHTML = "";

    if (email == null) {
        email = window.localStorage.getItem("currentUser");
    }

    let request = new XMLHttpRequest();
    // send request
    request.open("GET", "/get-user-messages-by-email", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.setRequestHeader("Email", email);
    request.send();
    // request to server
    request.onreadystatechange = function() {
        let messagesHTML = "";
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(this.responseText);
            for (let i = 0; i < data.length; i++) {
                messagesHTML += "<div class='messages-pair'>";
                messagesHTML += "<p>" + data[data.length - i - 1][1] + "</p>";
                messagesHTML += "<p>" + data[data.length - i - 1][2] + "</p>";
                messagesHTML += "</div>";
            }
        }
        else if (this.status == 403) {
            messagesHTML = "messages not found";
        }
        else if (this.status == 404) {
            messagesHTML = "User not found";
        }
        else {
            messagesHTML = "No messages";
        }
        userFeedDiv.innerHTML = messagesHTML;
    }
}


// validates password
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

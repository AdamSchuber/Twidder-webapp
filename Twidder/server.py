from flask import Flask, request, jsonify
from flask_sock import Sock
import database_helper
import secrets

# contain server-side remote procedures

app = Flask(__name__, static_url_path="", static_folder="static")
sock = Sock(app)

database_helper.init_db(app)

@app.route("/", methods=['GET'])
def root():
    return app.send_static_file("client.html"), 200

@sock.route('/echo')
def echo_socket(ws):
    while not ws.closed:
        data = ws.receive()
        ws.send(data)

@app.teardown_request
def teardown(exception):
    # close db connection
    database_helper.close_db()

@app.route('/sign-in', methods=['POST'])
def sign_in():
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    # get user data from db
    user = database_helper.get_user(email)
    # check if user exits and that the password is correct
    if user is not None:
        if user[6] == password:
            # create a token
            token = secrets.token_urlsafe(16)
            # add user as logged in with token
            database_helper.add_login(email, token)
            return jsonify(token), 200
        # error wrong email or password
        return "", 404
    # error no user with that email
    return "", 400



@app.route('/sign-up', methods=['POST'])
def sign_up():
    data = request.get_json()
    # check if valid input
    if is_valid(data):
        # check if user exists
        if database_helper.get_user(data["email"]) is None:
            # add user with information
            created = database_helper.add_user(data["email"], data['firstname'], data["familyname"],
                                    data["gender"], data["city"], data["country"], data["password"])
            if created is not None:
                return "", 200
            # failed to create user
            return "", 404
        # user already exists
        return "", 409
    # invalid data
    return "", 400

# check if data is valid
def is_valid(data):
    if len(data) != 7:
        return False
    for key in data:
        if len(data[key]) < 1:
            return False
    if len(data['password']) < 5:
        return False
    return True

@app.route('/sign-out', methods=['POST'])
def sign_out():
    token = request.headers["Authorization"]
    if token is not None:
        # remove logged-in user
        database_helper.remove_login(token)
        users = database_helper.get_all_login()
        print("logged in users: ", users)
        return "", 200
    return "", 404


@app.route('/change-password', methods=['POST'])
def change_password():
    # get token
    data = request.get_json()
    token = request.headers['Authorization']
    user_login = database_helper.get_login(token)
    print("changing password for user: ", user_login)
    # check that user is logged in
    if user_login is not None:
        data = request.get_json()
        new_password = data['newPassword']
        old_password = data['oldPassword']
        # get user with email
        user = database_helper.get_user(user_login[0])
        # check if user exist and passwords is the same
        if user is not None and user[6] == old_password:
            # password requierment
            if len(new_password) < 5:
                # error password to short
                return "", 404
            database_helper.set_password(user[0], new_password)
            return "", 200
        # user not found or wrong password
        return "", 403
    # user not logged in
    return "", 401


@app.route('/get-user-data-by-token', methods=['GET'])
def get_user_data_by_token():
    # get token
    token = request.headers['Authorization']
    user_login = database_helper.get_login(token)
    # check if user is already logged-in
    if user_login is not None:
        # get user with email [0]
        user = database_helper.get_user(user_login[0])
        if user is not None:
            return jsonify(user), 200
        # user not found
        return "", 404
    # user not logged in
    return "", 401

@app.route('/get-user-data-by-email', methods=['GET'])
def get_user_data_by_email():
    email = request.headers['Email']
    user = database_helper.get_user(email)
    # check if user exist
    if user is not None:
        return jsonify(user), 200
    # user not found
    return "", 404

@app.route('/get-user-messages-by-token', methods=['GET'])
def get_user_messages_by_token():
    # get token
    token = request.headers['Authorization']
    user_login = database_helper.get_login(token)
    # check if user is already logged-in
    if user_login is not None:
        # get messages with email [0] and return
        messages = database_helper.get_messages(user_login[0])
        if messages is not None:
            return jsonify(messages), 200
        # messages not found
        return "", 404
    # user not logged in
    return "", 401

@app.route('/get-user-messages-by-email', methods=['GET'])
def get_user_messages_by_email():
    email = request.headers['Email']
    # check if user exists
    user = database_helper.get_user(email)
    if user is not None:
        # get messages and return
        messages = database_helper.get_messages(email)
        if messages is not None:
            return jsonify(messages), 200
        # messages not found
        return "", 403
    # user not found
    return "", 404


@app.route('/post-message', methods=['POST'])
def post_message():
    # get token
    token = request.headers['Authorization']
    user_login = database_helper.get_login(token)
    # check if user is already logged-in
    if user_login is not None:
        data = request.get_json()
        message = data['message']
        try:
            email = data['email']
        except:
            email = user_login[0]
        # check if user exists
        if database_helper.get_user(email):
            # add to message queue in db
            database_helper.add_message(email, user_login[0], message)
            return "", 200
        # user not found
        return "", 404
    # user not logged in
    return "", 401

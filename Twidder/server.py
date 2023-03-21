from flask import Flask, request, jsonify
from flask_socketio import SocketIO, send, emit, disconnect
from email_validator import validate_email, EmailNotValidError
import database_helper
import secrets

# contain server-side remote procedures
app = Flask(__name__, static_url_path="", static_folder="static")
database_helper.init_db(app)
socketio = SocketIO(app, cors_allowed_origins="*")
sockets = dict()

@socketio.on('addSession')
def handle_add(email):
    try:
        print("Connection established")
        sid = request.sid
        print("user is added as socket: ", email)
        sockets[email] = sid
    except:
        print("Connection failed")
        return "", 400
    return "", 200

@app.route("/", methods=['GET'])
def root():
    return app.send_static_file("client.html"), 200

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
    # check if user exists and password is correct
    if user is not None:
        if user[6] == password:
            if email in sockets:
                # disconnect and logout old socket
                print("user is already logged in, removing old socket")
                socketio.server.disconnect(sockets[email])
                sockets.pop(email)
            # create a token
            token = secrets.token_hex(16)
            # add user as logged in with token
            database_helper.add_login(email, token)
            return jsonify(token), 200
        # error wrong email or password
        return "", 404
    # email is invalid
    return "", 400


@app.route('/sign-up', methods=['POST'])
def sign_up():
    data = request.get_json()
    # validate email
    email = data["email"]
    try:
        valid = validate_email(email)
        email = valid.email
    except EmailNotValidError as e:
        # email is not valid
        return "", 401
    # check if valid input
    if is_valid(data):
        # check if user exists
        if database_helper.get_user(data["email"]) is None:
            # add user with information
            created = database_helper.add_user(data["email"], data['firstname'], data["familyname"],
                                               data["gender"], data["city"], data["country"], data["password"])
            if created is not None:
                # user created
                return "", 201
            # failed to create user
            return "", 404
        # user already exists
        return "", 409
    # invalid data
    return "", 401

# check if data is valid
def is_valid(data):
    if len(data) != 7:
        return False
    if len(data['password']) < 5:
        return False
    return True

@app.route('/sign-out', methods=['POST'])
def sign_out():
    token = request.headers["Authorization"]
    user = database_helper.get_login(token)
    if user is not None:
        socketio.server.disconnect(sockets[user[0]])
        del sockets[user[0]]
        return "", 200    
    return "", 200

@app.route('/change-password', methods=['PUT'])
def change_password():
    # get token
    data = request.get_json()
    token = request.headers['Authorization']
    user_login = database_helper.get_login(token)
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
                return "", 401
            database_helper.set_password(user[0], new_password)
            return "", 200
        # user not found or wrong password
        return "", 404
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
    user = database_helper.get_login_email(email)
    # check if user is already logged-in
    if user is not None:
        user = database_helper.get_user(email)   
        # check if user exist
        if user is not None:
            return jsonify(user), 200
        # user not found
        return "", 404
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
    user = database_helper.get_login_email(email)
    # check if user is already logged-in
    if user is not None:
        # check if user exists
        user = database_helper.get_user(email)
        if user is not None:
            # get messages and return
            messages = database_helper.get_messages(email)
            if messages is not None:
                return jsonify(messages), 200
            # messages not found
            return "", 404
        # user not found
        return "", 404
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

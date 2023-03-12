import sqlite3
from flask import g
# used by server to access db

DATABASE = "database.db"

#  get the db connection
def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

# initializes the db
def init_db(app):
    # opens an application context
    with app.app_context():
        db = get_db()
        # open the db schema to create db tables
        with app.open_resource("schema.sql", mode="r") as f:
            db.cursor().executescript(f.read())
        db.commit()

# closes the db connection
def close_db():
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

#  executes the query
def query_db(query, args=(), one=False):
    # executes the query
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    get_db().commit()
    return (rv[0] if rv else None) if one else rv

# adds a user to the db
def add_user(email, firstname, familyname, gender, city, country, password):
    return query_db("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)", 
                [email, firstname, familyname, gender, city, country, password])

# gets a user from the db
def get_user(email):
    return query_db('SELECT * FROM users WHERE email = ?', [email] , one=True)

def get_user_token(token):
    return query_db('SELECT * FROM users WHERE email = ' + token, [] , one=True)

# sets the password of a user
def set_password(email, password):
    query_db('UPDATE users SET password = ? WHERE email = ?', [password, email])

# adds a logged in user
def add_login(email, token):
    query_db('INSERT INTO loggedInUsers (email, token) VALUES (?,?)', [email, token])

# removes a logged in user from the db
def remove_login(token):
    query_db('DELETE FROM loggedInUsers WHERE token = ' + token, [])

# gets a logged in user from the db
def get_login(token):
    # this is sql injection prone
    return query_db('SELECT * FROM loggedInUsers WHERE token = ' + token, [], one=True)

def get_all_login():
    return query_db('SELECT * FROM loggedInUsers')

def get_login_email(email):
    return query_db('SELECT * FROM loggedInUsers WHERE email = ?', [email], one=True)

# adds a message to the db
def add_message(to_email, from_email, message):
    query_db('INSERT INTO messages (toEmail, fromEmail, message) VALUES (?,?,?)', [to_email, from_email, message])

# gets all messages for a user
def get_messages(email):
    return query_db('SELECT * FROM messages WHERE toEmail = ?', [email])


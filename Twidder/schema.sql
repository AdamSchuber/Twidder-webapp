
CREATE TABLE IF NOT EXISTS users(
    email VARCHAR(32),
    firstname VARCHAR(32),
    familyname VARCHAR(32),
    gender VARCHAR(32),
    city VARCHAR(32),
    country VARCHAR(32),
    password VARCHAR(32),
    PRIMARY KEY(email)
);

CREATE TABLE IF NOT EXISTS loggedInUsers(
    email VARCHAR(32),
    token VARCHAR(64),
    sid VARCHAR(64),
    PRIMARY KEY(token)
);

CREATE TABLE IF NOT EXISTS messages(
    toEmail VARCHAR(32),
    fromEmail VARCHAR(32),
    message VARCHAR(144),
    ID INTEGER PRIMARY KEY AUTOINCREMENT
);

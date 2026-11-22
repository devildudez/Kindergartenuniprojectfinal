CREATE TABLE guardians(
    id  INT Primary KEY,
    name NOT NULL,
    email VARCHAR(250),
);
CREATE TABLE groups(
    id INT PRIMARY KEY ,
    name VARCHAR(100) NOT NULL
);
CREATE TABLE children(
    id INT PRIMARY KEY
    name VARCHAR(250) NOT NULL,
    birthdate date,
    group_id INT REFERENCES groups(id),
    guardian_id INT REFERENCES guardians(id),
    status VARCHAR(20)

);
CREATE TABLE users(
    id INT PRIMARY KEY,
    full_name VARCHAR(250),
    password_hash text
)
/*
 children 1:m guardians
groups 1:m children
 */
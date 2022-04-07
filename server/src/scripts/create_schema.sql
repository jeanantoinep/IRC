-- CREATE DATABASE `irc`;

USE `irc`;

CREATE TABLE IF NOT EXISTS `room` (
id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
name VARCHAR(255) NOT NULL,
UNIQUE (id)
);

CREATE TABLE IF NOT EXISTS `user` (
id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
username VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL,
UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS `friend` (
user_id_1 INT NOT NULL,
user_id_2 INT NOT NULL,
FOREIGN KEY (user_id_1) REFERENCES user(id),
FOREIGN KEY (user_id_2) REFERENCES user(id) 
);

CREATE TABLE IF NOT EXISTS `message` (
id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
user_id INT NOT NULL,
room_id INT NOT NULL,
message VARCHAR(255) NOT NULL,
FOREIGN KEY (user_id) REFERENCES user(id),
FOREIGN KEY (room_id) REFERENCES room(id)
);

CREATE TABLE IF NOT EXISTS `private_message` (
id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
receiver_id INT NOT NULL,
sender_id INT NOT NULL,
message VARCHAR(255) NOT NULL,
FOREIGN KEY (receiver_id) REFERENCES user(id),
FOREIGN KEY (sender_id) REFERENCES user(id)
);
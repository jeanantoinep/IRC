CREATE DATABASE IF NOT EXISTS irc;

USE irc;

CREATE TABLE IF NOT EXISTS room (
id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
nom VARCHAR(100) NOT NULL
);
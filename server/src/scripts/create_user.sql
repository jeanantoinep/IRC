CREATE USER IF NOT EXISTS 'irc' IDENTIFIED BY 'Password.2022';
GRANT ALL PRIVILEGES ON irc.* TO 'irc'@'localhost';
flush privileges;
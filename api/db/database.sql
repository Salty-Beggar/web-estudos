GRANT ALL PRIVILEGES ON *.* TO 'root'@'172.18.%' IDENTIFIED BY '1234' WITH GRANT OPTION;
CREATE DATABASE IF NOT EXISTS web_estudos;

USE web_estudos;

CREATE TABLE IF NOT EXISTS events(
    id int not null primary key
);
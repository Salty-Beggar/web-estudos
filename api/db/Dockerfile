FROM debian:latest
RUN apt-get update
RUN apt install -y mariadb-server mariadb-client
WORKDIR /var/lib/mysql
COPY ./database.sql ./
COPY ./my.cnf /etc/mysql
RUN service mariadb start && mariadb < ./database.sql
CMD service mariadb start && tail -f /dev/null

FROM debian:trixie-backports
RUN apt-get update
RUN apt install -y mariadb-server mariadb-client php-cli php-common php-mysql
WORKDIR /var/lib/mysql
COPY ./database.sql /srv
COPY ./my.cnf /etc/mysql
CMD service mariadb start && mariadb < /srv/database.sql && tail -f /dev/null

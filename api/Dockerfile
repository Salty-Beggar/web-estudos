FROM debian:latest
RUN apt-get update
RUN apt install -y apache2 libapache2-mod-php php-common php-cli php-mysql
WORKDIR /var/www/html
RUN rm index.html
RUN /etc/init.d/apache2 start
CMD apachectl -D FOREGROUND
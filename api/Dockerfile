FROM debian:latest
RUN apt-get update
RUN apt install -y apache2 libapache2-mod-php php-common php-cli php-mysql
COPY ./apache2.conf /etc/apache2/apache2.conf
WORKDIR /var/www/html
RUN rm index.html
RUN a2enmod rewrite
RUN /etc/init.d/apache2 start
CMD apachectl -D FOREGROUND
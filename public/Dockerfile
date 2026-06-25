FROM debian:latest

RUN apt-get update

RUN apt install -y apache2 libapache2-mod-php php-common php-cli

RUN a2enmod rewrite

RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

WORKDIR /var/www/html

RUN rm -f index.html

CMD apachectl -D FOREGROUND
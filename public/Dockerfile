FROM debian:latest
RUN /bin/sh -c apt-get update
RUN /bin/sh -c apt install -y apache2 libapache2-mod-php php-common php-cli
WORKDIR /var/www/html
RUN /bin/sh -c rm index.html
RUN /bin/sh -c /etc/init.d/apache2 start
CMD ["/bin/sh", "-c", "apachectl -D"]
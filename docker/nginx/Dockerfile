FROM nginx:alpine
WORKDIR /var/www
RUN apk --update --no-cache add bash
CMD wait-for-it -t 0 php-fpm:9000 -- nginx
EXPOSE 80 443
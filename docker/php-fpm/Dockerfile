FROM php:8.0-fpm-alpine

COPY --from=composer /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

RUN apk --update --no-cache add git yarn bash \
    && docker-php-ext-install pdo_mysql

CMD composer install \
    && yarn run build \
    && php-fpm

EXPOSE 9000
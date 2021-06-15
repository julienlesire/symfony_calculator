# Symfony calculator
A Google calculator clone using Symfony and React

## Prerequisite

You must have installed docker.

## Installation

1. Clone the repository.

2. Start the container :
```
docker-compose -f ./docker/docker-compose.yml up
```

3. Compile the project :
```
yarn run build
```

4. Visit http://localhost

## Tests

### End-to-end tests
The container e2e runs tests and prints their result using Cypress.

### Unit tests
Using the container php-fpm, run :
```
/var/www/bin/phpunit /var/www/tests
```

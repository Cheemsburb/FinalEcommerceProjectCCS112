FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    git zip unzip curl libpng-dev libjpeg-dev libfreetype6-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set the working directory to Laravel's public folder
WORKDIR /var/www/html

# Copy Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Copy Apache vhost config
COPY ./apache/laravel.conf /etc/apache2/sites-available/000-default.conf

# Permissions
RUN chown -R www-data:www-data /var/www/html


EXPOSE 80

CMD chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true \
    && apache2-foreground


#!/usr/bin/env bash
#cron -f &
mod_wsgi-docker-start /app/app.wsgi --user=www-data --group=root --python-path=/app/env/lib/python2.7/site-packages/

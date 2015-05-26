#!/bin/bash
uwsgi --master --processes 2 --socket 127.0.0.1:8080 -w runserver:app

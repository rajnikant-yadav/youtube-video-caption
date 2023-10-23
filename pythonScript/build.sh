#!/bin/bash

# install dependencies
pip install gunicorn
pip install -r requirements.txt

# run the application
gunicorn app:app
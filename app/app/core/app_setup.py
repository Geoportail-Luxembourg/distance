from ..main import app
from ..api import api
from flask import render_template, url_for


@app.route("/")
def hello():
    # This could also be returning an index.html
    # return '''Hello World from Flask in a uWSGI Nginx Docker container with \
    #  Python 3.7 (from the example template), 
    #  try also: <a href="/stops/">/stops/</a>'''
    return render_template('index.html')

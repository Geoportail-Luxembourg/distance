from flask import Flask
from flask import url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, static_folder="custom_static")

from .api.utils import ListConverter
app.url_map.converters['list'] = ListConverter

from .core import app_setup


if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=True, port=80)

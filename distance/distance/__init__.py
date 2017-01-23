from pyramid.config import Configurator
from sqlalchemy import engine_from_config

from .models import (
    DBSession,
    Base,
    )

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('pyramid_chameleon')
    config.add_route('ws_home', '/webservice')
    config.add_route('startpoints', '/webservice/startpoints')
    config.add_route('stops', '/stops')
    config.add_route('distance', '/webservice/{stops}')
    config.add_route('home', '/')
    config.scan()
    engine = engine_from_config(settings, 'sqlalchemy.')
    config.add_static_view('static', 'static', cache_max_age=3600)
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    return config.make_wsgi_app()

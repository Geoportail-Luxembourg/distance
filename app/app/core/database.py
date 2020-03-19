from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

engine = create_engine('sqlite:////app/app/distances_shortest.sqlite', convert_unicode=True)

Base = declarative_base()
Base.metadata.create_all(engine)
Base.metadata.bind = engine

DBSession = scoped_session(sessionmaker(bind=engine))
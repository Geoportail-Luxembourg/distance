from flask import jsonify

from ...core.database import DBSession
from ...models.stop import Distance
from ...main import app


@app.route('/stops/')
def route_stops():
    stops_data = DBSession.query(Distance.from_name).distinct().order_by(Distance.from_name.asc())
    stops = []
    for stop in stops_data:
        stops.append({'name': stop.from_name})
    return {'records': stops}

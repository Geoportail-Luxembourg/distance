from sqlalchemy import and_
from sqlalchemy.orm.exc import NoResultFound
from flask import request
from flask import render_template
from ...core.database import DBSession
from ...models.stop import Distance
from ...main import app

@app.route('/webservice/startpoints')
def route_webservice_startpoints():
    stops_data = DBSession.query(Distance.from_name).distinct().order_by(Distance.from_name.asc())
    stops = []
    for stop in stops_data:
        stops.append({'name': stop.from_name})
    return {'records': stops}

@app.route('/webservice/')
def route_webservice_example():
    return render_template('webservice.html')

# @app.route('/webservice/<startpoint>:')
# @app.route('/webservice/<startpoint>:<endpoint>')

@app.route('/webservice/<path:stops>')
def route_webservice_distance(stops="", formatStyle='json'):

    formatStyle = request.args.get('format', None)
    if formatStyle == None:
        formatStyle = 'json'

    stops = stops.split(":")

    print(stops)


    if formatStyle == 'json':
        return _get_distance(stops, True)
    else:
        return _get_distance(stops, False)


def _get_distance(stops, as_json=True):
    if len(stops)<2:
        # return topoints(request, stops[0])
        return {'calculated': 0, 'error': 'minimum 2 stops needed', 'examples': ['/webservice/startpoints', '/webservice/<stop1>:<stop2>', '/webservice/<stop1>:<stop2>?format=json or with ?format=string', '/webservice/<stop1>:...:<stopN>', '/webservice/<stop1>:...:<stopN>?format=json or with ?format=string']}
    else:
        i = 1
        _straight = 0
        _distance = 0
        flag = False
        while i < len(stops):
            
            _from = stops[i-1].lower()
            _to = stops[i].lower()
            
            try:
                result = DBSession.query(Distance).filter(and_(Distance._from == _from), Distance._to == _to).one()
                flag = True
            except NoResultFound:
                flag = False

            if flag:
                _straight += result.straight
                _distance += result.length
            
            i += 1 
            
        if as_json and flag:
            return {'from': _from, 'to': _to, 'straight': _straight, 'calculated': _distance}
        else:
            if flag:
                return str(_distance)
            else:
                return {'from': _from, 'to': _to, 'straight': 0, 'calculated': 0, 'error':'NOT VALID'}


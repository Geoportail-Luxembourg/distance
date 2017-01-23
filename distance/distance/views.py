from pyramid.view import view_config
from .models import Distance, DBSession
from sqlalchemy import and_
from pyramid.renderers import render_to_response


@view_config(route_name='home', renderer='templates/index.pt')
def home(request):
    return {}


@view_config(route_name='ws_home', renderer='templates/home.pt')
def ws_home(request):
    return {}

@view_config(route_name='stops', renderer='json')
def stops(request):
    result = DBSession.query(Distance.from_name).distinct()
    stops = []
    for r in result:
        stops.append({'name': r.from_name})
    return {'records': stops}

@view_config(route_name='startpoints', renderer='templates/distance.pt')
def startpoints(request):
    s = {}
    s['stops']=[]
    s['from_stop']= None
    result = DBSession.query(Distance.from_name).distinct()
    for r in result:
        print
        stop ={}
        stop['name'] = r.from_name
        stop['url'] = "/"+r.from_name
        s['stops'].append(stop)
    return s


def topoints(request, from_name):
    s = {}
    s['stops'] = []
    s['from_stop'] = from_name
    result = DBSession.query(Distance.to_name).distinct()
    for r in result:
        print
        stop ={}
        stop['name'] = r.to_name
        stop['url'] = "/"+from_name+":"+r.to_name
        s['stops'].append(stop)
    return render_to_response('templates/distance.pt',
                              s,
                              request=request)


@view_config(route_name='distance')
def distance(request):
    if 'format' in request.params and request.params['format']=='text':
        return render_to_response('string',_get_distance(request,False),request=request)
    else:
        return render_to_response('json',_get_distance(request,True),request=request)

def _get_distance(request,as_json=True):
    stops = request.matchdict['stops'].split(":")
    if len(stops)<2:
                return topoints(request, stops[0])
        #return {'error': 'minimum 2 stops needed'}
    else:
        i = 1
        _straight = 0
        _distance = 0
        while i < len(stops):

            _from = stops[i-1].lower()
            _to = stops[i].lower()
            result = DBSession.query(Distance).filter(and_(Distance.from_name == _from), Distance.to_name == _to).one()
            _straight += result.straight
            _distance += result.length
            i += 1
    if as_json:
        return {'from': _from, 'to': _to, 'straight': _straight, 'calculated': _distance}
    else:
        return _distance

def senseless_print():
    # Print something, just to demonstrate how to import modules
    print('Senseless print')

from werkzeug.routing import BaseConverter

class ListConverter(BaseConverter):

    def to_python(self, value):
        return value.split(':')

    def to_url(self, values):
        return ':'.join(BaseConverter.to_url(value)
                        for value in values)
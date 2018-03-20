# distance
webservice to calculate official distances according to https://data.public.lu/en/datasets/matrice-des-distances-sur-routes-nationales-et-cr/

# Usage

## Docker
a regular `docker build ./` would produce the docker image with the default name
*distance*. Then running the service can be done by issuing a 
docker run command, specifying the exposed ports.

```bash
docker build ./ -t distance
docker run -p "80:80" distance
```

## Docker compose
The `docker-compose.yaml` can be used to automatically create and start the
service in a single operation:

```bash
docker-compose app
```

If you want the service to be exposed on another port and use docker-compose
change the port in the `.env` file or run the `docker-compose` command overrriding
the port (`env PORT=8080 docker-compose up` if the image has already been created)

## Example queries

### Using the web browser

Once you have a running service, you can visually create a query by navigating
to [http://localhost/)](http://localhost/)
If you modified the exposed port by changing the `PORT` variable in the `.env`
file, change the URL accordingly.

### Using the API

To get the distance between multiple points, you can access the webservice for
example like:

[http://localhost/webservice/Luxembourg:Esch-sur-Alzette](http://localhost/webservice/Luxembourg:Esch-sur-Alzette)

This would return a json result like:

```json
{"calculated": 18.8, "from": "luxembourg", "straight": 16.8, "to": "esch-sur-alzette"}
```

FROM tiangolo/uwsgi-nginx-flask:python3.7

LABEL author="Mayer Joe"

RUN pip install --upgrade pip
COPY requirements.txt /app/requirements.txt

WORKDIR /app

ADD https://download.data.public.lu/resources/matrice-des-distances-sur-routes-nationales-et-cr/20170407-084048/distances_shortest.zip distances_shortest.zip
RUN unzip distances_shortest.zip
RUN rm -rf distances_shortest.zip

RUN pip install -r requirements.txt

COPY ./app /app

WORKDIR /app

ENV STATIC_PATH /app/custom_static

RUN mv distances_shortest.sqlite app/distances_shortest.sqlite

FROM grahamdumpleton/mod-wsgi-docker:python-2.7
RUN apt-get update && apt-get install -y python-pip virtualenv
ENV appdir /app
WORKDIR /app
##CREATE VIRTUAL ENV
RUN mkdir -p ${appdir}
RUN cd ${appdir} && virtualenv env
RUN echo alias ll=\'ls -lisa\' >> ~/.bashrc
RUN /bin/bash -c "source ${appdir}/env/bin/activate && pip install --upgrade pip && pip install --upgrade setuptools"
COPY app.wsgi ${appdir}
ADD https://download.data.public.lu/resources/matrice-des-distances-sur-routes-nationales-et-cr/20170120-163027/distances.zip ${appdir}/distances.sqlite
COPY startup.sh ${appdir}
COPY distance/requirements.txt ${appdir}/requirements.txt
RUN /bin/bash -c "source ${appdir}/env/bin/activate && pip install -r ${appdir}/requirements.txt"
COPY distance ${appdir}/distance
RUN /bin/bash -c "source ${appdir}/env/bin/activate && cd ${appdir}/distance/ && python setup.py install"
RUN chown -R whiskey: ${appdir} && chmod a+x ${appdir}/app.wsgi && chmod a+x ${appdir}/startup.sh
RUN chown -R whiskey: ${appdir}/distances.sqlite && chmod 400 ${appdir}/distance/production.ini
#DEFINE ENTRYPOINT
ENTRYPOINT /app/startup.sh
EXPOSE 80

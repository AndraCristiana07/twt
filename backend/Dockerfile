FROM python:3.12.4

# COPY app        /app/app
# COPY backend    /app/backend
# COPY tweets     /app/tweets
# COPY manage.py requirements.txt /app/
RUN mkdir /sqlite3
WORKDIR /app
# RUN apt-get update
# RUN apt install tree
# RUN tree
RUN python3 -m venv venv
COPY requirements.txt /app/requirements.txt
RUN . venv/bin/activate && pip install -r requirements.txt
ENV DJANGO_LOG_LEVEL=DEBUG
ENTRYPOINT  . venv/bin/activate && \
            curl http://elasticsearch:9200 && \
            echo "============= makemigrations =================" && \
            python manage.py makemigrations && \
            echo "============= migrate =================" && \
            python manage.py migrate && \ 
            echo "============= elasticsearch rebuild =================" && \
            ((python manage.py search_index --create -f) || (echo "y\n" | python manage.py search_index --rebuild)) && \
            echo "============= runserver =================" && \
            python -u manage.py runserver 0.0.0.0:8000

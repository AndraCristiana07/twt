FROM python:3

# COPY app        /app/app
# COPY backend    /app/backend
# COPY tweets     /app/tweets
COPY manage.py requirements.txt /app/
WORKDIR /app
RUN apt-get update
# RUN apt install tree
# RUN tree
RUN pip install -r requirements.txt
ENV  DJANGO_LOG_LEVEL=DEBUG
ENTRYPOINT  echo "============= makemigrations =================" && \
            python manage.py makemigrations && \
            echo "============= migrate =================" && \
            python manage.py migrate && \ 
            echo "============= elasticsearch rebuild =================" && \
            echo "y\n" | python manage.py search_index --rebuild  && \
            echo "============= runserver =================" && \
            python -u manage.py runserver 0.0.0.0:8000
# CMD ["python", "-u", "manage.py", "runserver", "0.0.0.0:8000"]

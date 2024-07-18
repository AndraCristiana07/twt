# FROM python:3 as compiler

# ENV PYTHONUNBUFFERED=1

# WORKDIR /app/

# RUN python -m venv /opt/venv

# ENV PATH="/opt/venv/bin:$PATH"

# COPY ./requirements.txt /app/requirements.txt 

# RUN pip install -r requirements.txt

# FROM python:3 as runner

# WORKDIR /app/

# COPY --from=compiler /opt/venv /opt/venv

# ENV PATH="/opt/venv/bin:$PATH"

# # RUN /venv/bin/pip install -r requirements.txt
# # RUN python3 -m venv /venv/env && /bin/bash -c "source /venv/env/bin/activate && pip install -r requirements.txt"

# COPY . /app/


# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# FROM python:3

# ENV VIRTUAL_ENV=/opt/venv
# WORKDIR /app

# RUN python3 -m venv $VIRTUAL_ENV
# ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# # COPY requirements.txt .
# RUN pip install -r requirements.txt

# # COPY /app/ .

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

FROM python:3

COPY app        /app/app
COPY backend    /app/backend
COPY tweets     /app/tweets
COPY manage.py requirements.txt /app/
WORKDIR /app
RUN apt-get update
RUN apt install tree
RUN tree
RUN pip install -r requirements.txt
ENTRYPOINT  echo "============= makemigrations =================" && \
            python manage.py makemigrations && \
            echo "============= migrate =================" && \
            python manage.py migrate && \ 
            echo "============= runserver =================" && \
            python -u manage.py runserver 0.0.0.0:8000
# CMD ["python", "-u", "manage.py", "runserver", "0.0.0.0:8000"]

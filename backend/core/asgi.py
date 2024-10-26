"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from app.views import NotificationsConsumer
# from app.kafka_consumer import consume_notifications
from .jwt_middleware import JWTAuthMiddleware
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# async def start_consumer():
#     consume_notifications()
# start_consumer()

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': JWTAuthMiddleware(
        URLRouter([
            path('ws/notifications/', NotificationsConsumer.as_asgi()),
        ])
    )
})


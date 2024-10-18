from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async
from app.models import User
import logging
import json
class JWTAuthMiddleware(BaseMiddleware):
    
    async def __call__(self, scope, receive, send):
    
        token = self.get_token_from_scope(scope)
        
        user = await self.get_user_from_token(token) 
        scope['user'] = user
        
        return await super().__call__(scope, receive, send)

    def get_token_from_scope(self, scope):
        
        access_token = scope.get("query_string").decode('utf-8').split('=')[1]
        # auth_header = headers.get(b'access_token').decode('utf-8')
        
        # if auth_header.startswith('Bearer '):
        #     return auth_header.split(' ')[1]
        # else:
        #     return None
        return access_token
        
    @database_sync_to_async
    def get_user_from_token(self, token):
        token = AccessToken(token)
        user_id = token['user_id']
        return User.objects.get(id=user_id)
        
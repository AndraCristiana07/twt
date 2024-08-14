from unittest.mock import patch
from django.test import TestCase
import logging
from rest_framework.permissions import IsAuthenticated, BasePermission
from tests.mocked import (
    mocked_get_session,
)
import json

logger = logging.getLogger(__name__)

# how to run
# python3 manage.py test --pattern="tests_*.py"


class PostTweetViewTestCase(TestCase):
    token_ = None

    def setUp(self):
        r = self.client.post(
            "http://localhost:8000/register/",
            {"username": "dummy", "password": "dummy", "email": "dummy@dummy.dummy"},
            follow=True,
        )
        self.assertEqual(r.status_code, 201, "User was not created")
        r = self.client.post(
            "http://localhost:8000/token/",
            {"password": "dummy", "email": "dummy@dummy.dummy"},
            follow=True,
        )
        self.assertEqual(r.status_code, 200, "Token could not be fetched")
        self.token_ = r.json()["access"]

    # @patch("tweets.views.get_session", mocked_get_session)  # for mocking
    # def test_post_tweet(self):
        # r = self.client.post(
        #     "http://localhost:8000/tweets/post",
        #     data={"content": "cccc"},
        #     content_type="application/json",
        #     headers={
        #         'Authorization': f"Bearer {self.token_}"
        #     },
        #     follow=True,
        # )
        # self.assertEqual(r.status_code, 201, "Tweet was not posted")

        # tweet_id=r.json()['tweet_id']

        # r = self.client.post(
        #     f"http://localhost:8000/tweets/like/{tweet_id}",
        #     content_type="application/json",
        #     headers={
        #         'Authorization': f"Bearer {self.token_}"
        #     },
        #     follow=True,
        # )
        # self.assertEqual(r.status_code, 201, "Tweet was not like'd")

from cassandra.cluster import Cluster, NoHostAvailable
from cassandra.auth import PlainTextAuthProvider
import time

def get_session():
    cluster = Cluster(['10.0.0.2'])
    cluster.auth_provider = PlainTextAuthProvider(username='andra', password='andra')
    session = cluster.connect()
    return session

def init_cassandra():
    session = get_session()
    session.execute("""
        CREATE KEYSPACE IF NOT EXISTS twitter
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}
    """)

    # session.set_keyspace('twitter')

    session.execute("""
        CREATE TABLE IF NOT EXISTS twitter.tweets (
            id UUID PRIMARY KEY,
            user_id TEXT,
            created_at TIMESTAMP,
            content TEXT
        )
    """)

def create_likes_table():
    session = get_session()
    session.execute("""
    CREATE TABLE IF NOT EXISTS twitter.likes (
        id UUID PRIMARY KEY,
        tweet_id UUID,
        user_id TEXT,
        created_at timestamp
    )
    """)

def create_comments_table():
    session = get_session()
    session.execute("""
    CREATE TABLE IF NOT EXISTS twitter.comments (
        id UUID PRIMARY KEY,
        tweet_id UUID,
        user_id TEXT,
        content TEXT,
        created_at timestamp
    )
    """)

def create_retweets_table():
    session = get_session()
    session.execute("""
    CREATE TABLE IF NOT EXISTS twitter.retweets (
        id UUID PRIMARY KEY,
        tweet_id UUID,
        user_id TEXT,
        created_at timestamp
    )
    """)

def create_followings_table():
    session = get_session()
    session.execute("""
    CREATE TABLE IF NOT EXISTS twitter.followings (
        id UUID PRIMARY KEY,
        user_id TEXT,
        following_id TEXT
    )
    """)

def wait_for_cassandra():
    print("Waiting on Cassandra")
    while True:
        try:
            get_session()
            print("Cassandra is up!")
            break
        except NoHostAvailable as e:
            print(e)
        time.sleep(25)

wait_for_cassandra()
init_cassandra()
create_likes_table()
create_comments_table()
create_retweets_table()
create_followings_table()
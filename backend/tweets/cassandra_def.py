from cassandra.cluster import Cluster, NoHostAvailable
from cassandra.auth import PlainTextAuthProvider
from cassandra.policies import DCAwareRoundRobinPolicy
import time

def get_session():
    cluster = Cluster(['cassandra'], load_balancing_policy=DCAwareRoundRobinPolicy(local_dc='datacenter1'), protocol_version=4)
    # cluster.auth_provider = PlainTextAuthProvider(username='andra', password='andra')
    session = cluster.connect()
    return session

def init_cassandra():
    session = get_session()
    session.execute("""
        CREATE KEYSPACE IF NOT EXISTS twitter
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}
    """)
    
    session.execute("""
        CREATE KEYSPACE IF NOT EXISTS seaweedfs
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}
    """)

    session.execute("""
        CREATE TABLE IF NOT EXISTS seaweedfs.filemeta (
            directory varchar,
            name varchar,
            meta blob,
            PRIMARY KEY (directory, name)
        ) WITH CLUSTERING ORDER BY (name ASC);
    """)

    session.execute("""
        CREATE TABLE IF NOT EXISTS twitter.tweets (
            id UUID PRIMARY KEY,
            user_id TEXT,
            created_at TIMESTAMP,
            content TEXT,
            retweet_id UUID,
            image_urls LIST<TEXT>, 
            likes INT,
            comments INT,
            retweets INT,
            
        )
    """)

    session.execute("""
    CREATE TABLE IF NOT EXISTS twitter.likes (
        id UUID PRIMARY KEY,
        tweet_id UUID,
        user_id TEXT,
        created_at timestamp
    )
    """)

    session.execute("""
    CREATE TABLE IF NOT EXISTS twitter.comments (
        id UUID PRIMARY KEY,
        tweet_id UUID,
        user_id TEXT,
        content TEXT,
        created_at timestamp,
        retweet_id UUID,
        image_urls LIST<TEXT>, 
        likes INT,
        comments INT,
        retweets INT,
    )
    """)


init_cassandra()

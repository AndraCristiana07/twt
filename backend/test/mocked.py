
import logging

logger = logging.getLogger(__name__)

class MockCassandraResponse:
    def __init__(self, values):
        self.val = values 
        logger.info(self.val)
    def one(self):
        return self.val[0]
    def __getitem__(self, idx):
        return self.val[idx]
    def __iter__(self):
        for x in self.val:
            yield x

class MockCassandraSession:
    def __init__(self, id) -> None:
        self.id = id
        self.execute_counter = 0
        self.answers = {
            1: [ None ],
            2: list(map(lambda x: [x], [
                { # tweet
                    'likes': 0
                },
                {}, # like
                {}, # insert
                {}, # update
            ]))
        }
        logger.debug(f'Session with id {id} created')
    def execute(self, fmt, arg):
        self.execute_counter += 1
        val = self.answers[self.id][self.execute_counter - 1]
        if not val:
            val = [ None ]
        return MockCassandraResponse(val)

sessions = [MockCassandraSession(1), MockCassandraSession(2)]

def mocked_get_session():
    logger.info("mocked session aquired")
    ss = sessions[0]
    sessions.pop(0)
    return ss

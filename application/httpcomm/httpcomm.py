import agent.thread
import Queue
import server

class HTTPcomm(agent.thread.Thread):

    # server instance
    server = None

    # holds commands to be sent to the GUI
    commands = None

    # holds data packets to be sent to GUI
    data = None

    def __init__(self, name="httpcomm"):
        agent.thread.Thread.__init__(self, name=name)
        self.commands = Queue.Queue()
        self.data = Queue.Queue()
        self.server = None

    def initialize(self):
        self.server = server.Server()
        self.server.start()

    def finalize(self):
        self.server.app.stop()

import threading
import Queue
from agent.util import call
import server

class HTTPcomm(threading.Thread):

    #queue for running commands
    q = None
    running = None

    #server
    server = None

    #holds commands to be sent to the GUI
    commands = None

    def __init__(self, thread_name):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False
        self.commands = []
        self.server = None

    def kill_thread(self):
        self.server.app.stop()
        self.running = False

    #method to initialize the server
    def run(self):
        self.running = True
        self.server = server.Server('server')
        self.server.start()
        while self.running:

            #wait for command
            cmd = self.q.get()

            #run command
            call(cmd)
        print 'Exited HTTPcomm'


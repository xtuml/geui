import web
from requests import *
import threading
import Queue
from agent.util import call

class Server(threading.Thread):

    #queue for commands
    q = None
    running = None

    #urls is a web.py convention. determines how requests are handled
    urls = (
        '/','INDEX',
        '/version','VERSION',
        '/js/(.*)','SERVE_JS',
        '/css/(.*)','SERVE_CSS',
        '/font/(.*)','SERVE_FONT',
        '/add_segment','ADD_SEGMENT',
        '/delete_segment','DELETE_SEGMENT',
        '/update_segment','UPDATE_SEGMENT',
        '/move_segment','MOVE_SEGMENT',
        '/create','CREATE_EXPERIMENT',
        '/save','SAVE_EXPERIMENT',
        '/open','OPEN_EXPERIMENT'
    )

    def __init__(self, thread_name):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False

    def kill_server(self):
        self.running = False

    #method to initialize the server
    def run(self):
        app = web.application(Server.urls, globals())
        app.run()
        self.running = True
        while self.running:

            #wait for command
            cmd = self.q.get()

            #run command
            call(cmd)


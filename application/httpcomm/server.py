import web
from requests import *
import threading

class Server(threading.Thread):
    
    app = None

    #urls is a web.py convention. determines how requests are handled
    urls = (
        '/command','COMMAND',
        '/save','SAVE_EXPERIMENT',
        '/get_experiments','GET_EXPERIMENT_LIST',
        '/open','OPEN_EXPERIMENT',
        '/create','CREATE_EXPERIMENT',
        '/add_segment','ADD_SEGMENT',
        '/delete_segment','DELETE_SEGMENT',
        '/update_segment','UPDATE_SEGMENT',
        '/move_segment','MOVE_SEGMENT',
        '/version','VERSION',
        '/exit','EXIT',
        '/','INDEX',
        '/js/(.*)','SERVE_JS',
        '/css/(.*)','SERVE_CSS',
        '/img/(.*)','SERVE_IMG',
        '/favicon.ico','SERVE_ICON'
    )

    def __init__(self, thread_name):
        threading.Thread.__init__(self, name=thread_name)
        self.app = web.application(Server.urls, globals())

    #method to initialize the server
    def run(self):
        self.app.run()

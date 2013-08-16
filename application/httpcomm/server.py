import web
from requests import *
import threading

class Server(threading.Thread):
    
    app = None

    #urls is a web.py convention. determines how requests are handled
    urls = (
        '/command','COMMAND',
        '/start_session','START_SESSION',
        '/get_session','GET_SESSION',
        '/save','SAVE_EXPERIMENT',
        '/get_experiments','GET_EXPERIMENT_LIST',
        '/table','REQUEST_TABLE',
        '/open','OPEN_EXPERIMENT',
        '/create','CREATE_EXPERIMENT',
        '/delete','DELETE_EXPERIMENT',
        '/upload','UPLOAD_FILE',
        '/add_pattern','ADD_PATTERN',
        '/delete_pattern','DELETE_PATTERN',
        '/move_pattern','MOVE_PATTERN',
        '/update_pattern','UPDATE_PATTERN',
        '/add_segment','ADD_SEGMENT',
        '/delete_segment','DELETE_SEGMENT',
        '/move_segment','MOVE_SEGMENT',
        '/update_segment','UPDATE_SEGMENT',
        '/version','VERSION',
        '/exit','EXIT',
        '/download', 'DOWNLOAD',
        '/','INDEX',
        '/js/(.*)','SERVE_JS',
        '/css/(.*)','SERVE_CSS',
        '/img/(.*)','SERVE_IMG',
        '/favicon.ico','SERVE_ICON'
    )

    def __init__(self, thread_name='server'):
        threading.Thread.__init__(self, name=thread_name)
        self.app = web.application(Server.urls, globals())

    #method to initialize the server
    def run(self):
        self.app.run()

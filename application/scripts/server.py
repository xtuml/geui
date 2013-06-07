import web
#from requests import *
from commands import *
from experiment import Experiment

class Server:

    current_experiment = Experiment()   #publicly accessible current experiment

    #urls is a web.py convention. determines how requests are handled
    urls = (
        '/','INDEX',
        #'/js/(.*)','script_handler',
        '/js/(.*)','SERVE_JS',
        #'/css/(.*)','script_handler2',
        '/css/(.*)','SERVE_CSS',
        #'/font/(.*)','script_handler3',
        '/font/(.*)','SERVE_FONT',
        #'/add_segment','AddSegment',
        '/add_segment','ADD_SEGMENT',
        #'/delete_segment','DeleteSegment',
        '/delete_segment','DELETE_SEGMENT',
        #'/update_segment','UpdateSegment',
        '/update_segment','UPDATE_SEGMENT',
        #'/switch_segment','SwitchSegment',
        '/switch_segment','MOVE_SEGMENT',
        #'/open','OpenFile',
        '/open','CREATE_EXPERIMENT', #temporary
        #'/open_table','OpenTable'
        '/open_table','TEMP_OPEN_TABLE'
    )

    #static method to initialize the server
    @staticmethod
    def run():
        app = web.application(Server.urls, globals())
        app.run()


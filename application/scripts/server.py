import web
from commands import *
from experiment import Experiment

class Server:

    current_experiment = Experiment()   #publicly accessible current experiment. starts out with an empty experiment

    #urls is a web.py convention. determines how requests are handled
    urls = (
        '/','INDEX',
        '/js/(.*)','SERVE_JS',
        '/css/(.*)','SERVE_CSS',
        '/font/(.*)','SERVE_FONT',
        '/add_segment','ADD_SEGMENT',
        '/delete_segment','DELETE_SEGMENT',
        '/update_segment','UPDATE_SEGMENT',
        '/switch_segment','MOVE_SEGMENT',
        '/create','CREATE_EXPERIMENT',
        '/save','SAVE_EXPERIMENT',
        '/open','OPEN_EXPERIMENT'
    )

    #static method to initialize the server
    @staticmethod
    def run():
        app = web.application(Server.urls, globals())
        app.run()


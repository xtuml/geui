from flask import Flask
from jinja2 import ChoiceLoader, FileSystemLoader
import threading
import agent.thread

from routes.index import IndexView

class Server(agent.thread.Thread):

    app = None

    port = None
    debug = None

    httpcomm = None
    
    def __init__(self, name="server", port=8080, debug=False, httpcomm=None):
        agent.thread.Thread.__init__(self, name=name)

        # setup attributes
        self.port = port
        self.debug = debug
        self.httpcomm = httpcomm

        # create app
        self.app = Flask(name)

        # register pages
        IndexView.httpcomm = self.httpcomm
        self.app.register_blueprint(IndexView.view)

    def initialize(self):
        self.app.run(use_reloader=False, port=self.port, debug=self.debug)

    def stop(self):
        stop_server = request.environ.get('werkzeug.server.shutdown')
        if func is None:
            raise RuntimeError('Not running with the Werkzeug Server')
        stop_server()

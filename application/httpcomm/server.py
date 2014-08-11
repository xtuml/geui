from flask import Flask, redirect
from jinja2 import ChoiceLoader, FileSystemLoader
import threading
import agent.thread

from routes.index import IndexView
from routes.welcome import WelcomeView
from routes.experiment import ExperimentView

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

        # set up templates
        self.app.jinja_loader = FileSystemLoader(["httpcomm/templates/", "httpcomm/views/"])
        self.app.jinja_env.cache = None

        # register pages
        IndexView.httpcomm = self.httpcomm
        WelcomeView.httpcomm = self.httpcomm
        ExperimentView.httpcomm = self.httpcomm

        self.app.register_blueprint(IndexView.view)
        self.app.register_blueprint(WelcomeView.view)
        self.app.register_blueprint(ExperimentView.view)

    def initialize(self):
        self.app.run(use_reloader=False, port=self.port, debug=self.debug)

    def stop(self):
        stop_server = request.environ.get('werkzeug.server.shutdown')
        if func is None:
            raise RuntimeError('Not running with the Werkzeug Server')
        stop_server()

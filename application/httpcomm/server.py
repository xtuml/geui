from flask import Flask
from flask import request
from flask import render_template
from jinja2 import ChoiceLoader
from jinja2 import FileSystemLoader
from flask.ext.classy import FlaskView, route
import threading
import agent.thread

class Server(agent.thread.Thread):

    app = None

    port = None
    debug = None
    
    def __init__(self, name="server", port=8080, debug=False):
        agent.thread.Thread.__init__(self, name=name)

        # setup attributes
        self.port = port
        self.debug = debug

        # create app
        self.app = Flask(name)

        # set up templates
        self.app.jinja_loader = FileSystemLoader(["httpcomm/templates/", "httpcomm/views/"])
        self.app.jinja_env.cache = None

        # register pages
        self.IndexView.register(self.app)

    def initialize(self):
        self.app.run(use_reloader=False, port=self.port, debug=self.debug)

    def stop(self):
        stop_server = request.environ.get('werkzeug.server.shutdown')
        if func is None:
            raise RuntimeError('Not running with the Werkzeug Server')
        stop_server()

    class IndexView(FlaskView):
        route_base = "/"

        def index(self):
            return render_template("geui.html")

        @route("/command/", methods=["GET"])
        def command(self):
            for t in threading.enumerate():
                if t.name == "httpcomm":
                    if not t.commands.empty():
                        message = t.commands.get()
                        #logger = logging.getLogger("agent_log")
                        #logger.info("Message sent: '" + message[0] + "' to GUI at [" + time.ctime() + "]")
                        return message[1]
                    else:
                        return "NoLog"              # tells the webpy server not to log

        def data(self):
            return ""

        @route("/save/", methods=["POST"])
        def save(self):
            for t in threading.enumerate():
                if t.name == "httpcomm":
                    t.q.put([t.save_experiment])
                    break
            return ""

        def get_experiments(self):
            if request.method == "GET":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        t.q.put([t.get_experiments])
                        break
            return ""

        @route("/table/", methods=["POST"])
        def table(self):
            for t in threading.enumerate():
                if t.name == "httpcomm":
                    data = request.form
                    t.q.put([t.request_table, data["table_id"], data["position"]])
                    break
            return ""

        @route("/open/", methods=["POST"])
        def open(self):
            for t in threading.enumerate():
                if t.name == "httpcomm":
                    data = request.form
                    t.q.put([t.open_experiment, data["name"]])
                    break
            return ""

        def create(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.create_experiment, data["name"]])
                        break
            return ""

        def delete(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.delete_experiment, data["name"]])
                        break
            return ""

        def upload(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.upload_file, data["name"], data["contents"]])
                        break
            return ""

        def add_pattern(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.add_pattern, float(data["start_value"]), float(data["end_value"]), float(data["rate"]), float(data["duration"]), int(data["repeat_value"])])
                        break
            return ""

        def delete_pattern(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.delete_pattern, data["positions"]])
                        break
            return ""

        def move_pattern(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.move_pattern, int(data["position"]), int(data["destination"])])
                        break
            return ""

        def update_pattern(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.update_pattern, float(data["repeat_value"]), int(data["position"])])
                        break
            return ""

        def add_segment(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.add_segment, float(data["start_value"]), float(data["end_value"]), float(data["rate"]), float(data["duration"]), int(data["pattern"])])
                        break
            return ""

        def delete_segment(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.delete_segment, data["positions"], int(data["pattern"])])
                        break
            return ""

        def move_segment(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.move_segment, int(data["position"]), int(data["destination"]), int(data["pattern"])])
                        break
            return ""

        def update_segment(self):
            if request.method == "POST":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        data = request.form
                        t.q.put([t.update_segment, float(data["start_value"]), float(data["end_value"]), float(data["rate"]), float(data["duration"]), int(data["position"]), int(data["pattern"])])
                        break
            return ""

        def version(self):
            if request.method == "GET":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        t.q.put([t.get_version])
                        break
            return ""

        def exit(self):
            if request.method == "GET":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        t.q.put([t.exit])
                        break
            return ""

        def run_experiment(self):
            if request.method == "GET":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        t.q.put([t.download])
                        t.q.put([t.run_experiment])
                    elif t.name == "test":              # temporary for easy demo
                        #t.q.put([t.test_data])
                        pass
            return ""

        def download(self):
            if request.method == "GET":
                for t in threading.enumerate():
                    if t.name == "httpcomm":
                        t.q.put([t.download])
                        break
            return ""

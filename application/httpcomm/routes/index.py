from flask import request, render_template, Blueprint, redirect
import threading
import logging
import time
import json

# index view
class IndexView:

    view = Blueprint("index", "index")      # blueprint object

    httpcomm = None

    @view.route("/")
    def index():
        return redirect("/welcome")

    @view.route("/load_widget/", methods=["GET"])
    def load_widget():
        data = json.loads(str(request.args.get("data")))
        return render_template(str(data["template"]), context=data["context"])

    @view.route("/command/", methods=["GET"])
    def command():
        if not IndexView.httpcomm.commands.empty():
            message = IndexView.httpcomm.commands.get()
            logger = logging.getLogger("agent_log")
            logger.info("Message sent: '" + message[0] + "' to GUI at [" + time.ctime() + "]")
            return message[1]
        else:
            return "NoLog"              # tells the webpy server not to log

    @view.route("/data/", methods=["GET"])
    def data():
        return ""

    @view.route("/save/", methods=["POST"])
    def save():
        IndexView.httpcomm.q.put([IndexView.httpcomm.save_experiment])
        return ""

    @view.route("/table/", methods=["POST"])
    def table():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.request_table, data["table_id"], int(data["position"])])
        return ""

    @view.route("/open/", methods=["POST"])
    def open():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.open_experiment, data["name"]])
        return ""

    @view.route("/delete/", methods=["POST"])
    def delete():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.delete_experiment, data["name"]])
        return ""

    @view.route("/upload/", methods=["POST"])
    def upload():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.upload_file, data["name"], data["contents"]])
        return ""

    @view.route("/add_pattern/", methods=["POST"])
    def add_pattern():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.add_pattern, float(data["start_value"]), float(data["end_value"]), float(data["rate"]), float(data["duration"]), int(data["repeat_value"])])
        return ""

    @view.route("/delete_pattern/", methods=["POST"])
    def delete_pattern():
        data = request.form
        positions = []
        for pos in data.getlist("positions[]"):
            positions.append(int(pos))
        IndexView.httpcomm.q.put([IndexView.httpcomm.delete_pattern, positions])
        return ""

    @view.route("/move_pattern/", methods=["POST"])
    def move_pattern():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.move_pattern, int(data["position"]), int(data["destination"])])
        return ""

    @view.route("/update_pattern/", methods=["POST"])
    def update_pattern():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.update_pattern, float(data["repeat_value"]), int(data["position"])])
        return ""

    @view.route("/add_segment/", methods=["POST"])
    def add_segment():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.add_segment, float(data["start_value"]), float(data["end_value"]), float(data["rate"]), float(data["duration"]), int(data["pattern"])])
        return ""

    @view.route("/delete_segment/", methods=["POST"])
    def delete_segment():
        data = request.form
        positions = []
        for pos in data.getlist("positions[]"):
            positions.append(int(pos))
        IndexView.httpcomm.q.put([IndexView.httpcomm.delete_segment, positions, int(data["pattern"])])
        return ""

    @view.route("/move_segment/", methods=["POST"])
    def move_segment():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.move_segment, int(data["position"]), int(data["destination"]), int(data["pattern"])])
        return ""

    @view.route("/update_segment/", methods=["POST"])
    def update_segment():
        data = request.form
        IndexView.httpcomm.q.put([IndexView.httpcomm.update_segment, float(data["start_value"]), float(data["end_value"]), float(data["rate"]), float(data["duration"]), int(data["position"]), int(data["pattern"])])
        return ""

    @view.route("/version/", methods=["GET"])
    def version():
        IndexView.httpcomm.q.put([IndexView.httpcomm.get_version])
        return ""

    @view.route("/exit/", methods=["GET"])
    def exit():
        IndexView.httpcomm.q.put([IndexView.httpcomm.exit])
        return ""

    @view.route("/run_experiment/", methods=["GET"])
    def run_experiment():
        IndexView.httpcomm.q.put([IndexView.httpcomm.download])
        IndexView.httpcomm.q.put([IndexView.httpcomm.run_experiment])
        return ""

    @view.route("/download/", methods=["GET"])
    def download():
        IndexView.httpcomm.q.put([IndexView.httpcomm.download])
        return ""

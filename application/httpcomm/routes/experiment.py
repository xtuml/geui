from flask import request, render_template, Blueprint
import threading
import logging
import time

# index view
class ExperimentView:

    view = Blueprint("experiment", "experiment")      # blueprint object

    base_url = "/experiment"

    httpcomm = None

    @view.route(base_url + "/")
    def index():
        return render_template("experiment.html")

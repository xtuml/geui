from flask import request, render_template, Blueprint
import threading
import logging
import time

# index view
class WelcomeView:

    view = Blueprint("welcome", "welcome")      # blueprint object

    base_url = "/welcome"

    httpcomm = None

    @view.route(base_url + "/")
    def index():
        return render_template("welcome.html")
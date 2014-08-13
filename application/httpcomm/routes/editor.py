from flask import request, render_template, Blueprint, redirect
import threading
import logging
import time
import json

# index view
class EditorView:

    view = Blueprint("editor", "editor")      # blueprint object

    base_url = "/editor"

    httpcomm = None

    @view.route(base_url + "/")
    def index():
        return redirect("/")

    @view.route(base_url + "/<name>")
    def open_experiment(name):
        if (EditorView.httpcomm.open_experiment(name)):
            return render_template("editor.html", name=name)
        else:
            return redirect("/")

    @view.route("/get_points")
    def get_points():
        return json.dumps({"points": EditorView.httpcomm.get_points()})

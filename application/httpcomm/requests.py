import web
import threading
import json
import time
import logging

# Outgoing command request
class COMMAND:
    def GET(self):
        for t in threading.enumerate():
            if t.name == "httpcomm":
                if not t.commands.empty():
                    message = t.commands.get()
                    logger = logging.getLogger("agent_log")
                    logger.info("Message sent: '" + message[0] + "' to GUI at [" + time.ctime() + "]")
                    return message[1]
                else:
                    return "NoLog"              # tells the webpy server not to log

# Outgoing data packet
class DATA:
    def GET(self):
        for t in threading.enumerate():
            if t.name == "httpcomm":
                if not t.data.empty():
                    packet = []
                    action = ""
                    while not t.data.empty():
                        pkt = t.data.get()
                        packet += pkt["points"]
                        action = pkt["action"]
                    print "Message sent: 'data' to GUI at [" + time.ctime() + "]"
                    data = {
                        "signal": "data",
                        "points": packet,
                        "action": action
                    }
                    return json.dumps(data)
                else:
                    return "NoLog"              # tells the webpy server not to log

# I/O Commands
#==========================#

class SAVE_EXPERIMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                t.q.put([t.save_experiment])

class GET_EXPERIMENT_LIST:
    def GET(self):
        for t in threading.enumerate():
            if t.name == "agent":
                t.q.put([t.get_experiments])

class REQUEST_TABLE:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.request_table, data["table_id"], data["position"]])

class OPEN_EXPERIMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.open_experiment, data["name"]])

class CREATE_EXPERIMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.create_experiment, data["name"]])

class DELETE_EXPERIMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.delete_experiment, data["name"]])

class UPLOAD_FILE:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.upload_file, data["name"], data["contents"]])

#==========================#

        
# Graph manipulation commands
#==========================#

class ADD_PATTERN:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.add_pattern, float(data["start_value"]), float(data["end_value"]), float(data["rate"]), float(data["duration"]), int(data["repeat_value"])])

class DELETE_PATTERN:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.delete_pattern, data["positions"]])

class MOVE_PATTERN:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.move_pattern, int(data["position"]), int(data["destination"])])

class UPDATE_PATTERN:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.update_pattern, float(data["repeat_value"]), int(data["position"])])

class ADD_SEGMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.add_segment, float(data["start_value"]), float(data["end_value"]), float(data["rate"]), float(data["duration"]), int(data["pattern"])])

class DELETE_SEGMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.delete_segment, data["positions"], int(data["pattern"])])

class MOVE_SEGMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.move_segment, int(data["position"]), int(data["destination"]), int(data["pattern"])])

class UPDATE_SEGMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == "agent":
                data = json.loads(web.data())
                t.q.put([t.update_segment, float(data["start_value"]), float(data["end_value"]), float(data["rate"]), float(data["duration"]), int(data["position"]), int(data["pattern"])])

#==========================#


# Other commands
#==========================#

# get version command
class VERSION:
    def GET(self):
        for t in threading.enumerate():
            if t.name == "agent":
                t.q.put([t.get_version])

# exit command
class EXIT:
    def GET(self):
        for t in threading.enumerate():
            if t.name == "agent":
                t.q.put([t.exit])

# download waveform command
class DOWNLOAD:
    def GET(self):
        for t in threading.enumerate():
            if t.name == "agent":
                t.q.put([t.download])

#==========================#


# Static commands
#==========================#

# renders the initial html file upon load
class INDEX:
    def GET(self):
        render = web.template.render("")
        return render.index()

# serve static files
# serves js files upon load (included in html. basis of client side operations)
class SERVE_JS:
    def GET(self, url):
        script = open("js/"+url,"r")
        return script.read()

# serves css files upon load. Used for styling (bootstrap)
class SERVE_CSS:
    def GET(self, url):
        script = open("css/"+url,"r")
        return script.read()

class SERVE_IMG:
    def GET(self, url):
        img = open("img/"+url,"rb")
        return img.read()

class SERVE_ICON:
    def GET(self):
        icon = open("img/favicon.ico","rb")
        return icon.read()

#==========================#

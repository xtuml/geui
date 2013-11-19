import agent.thread
import Queue
import server
import json

import eihttp

class HTTPcomm(agent.thread.Thread, eihttp.EIhttp):

    # server instance
    server = None

    # holds commands to be sent to the GUI
    commands = None

    # holds data packets to be sent to GUI
    data_out = None

    def __init__(self, name="httpcomm"):
        agent.thread.Thread.__init__(self, name=name)
        self.commands = Queue.Queue()
        self.data_out = Queue.Queue()
        self.server = None

    def initialize(self):
        self.server = server.Server()
        self.server.start()

    def finalize(self):
        self.server.app.stop()


    #------- Interface Methods -------#

    # version response from agent
    def version(self, version):
        data = {
            "signal": "version",
            "version": version
        }
        self.commands.put(["version", json.dumps(data)])

    # data packet from agent
    def data(self, points, action):
        if action == "start" or action == "onepacket":
            data = {
                "signal": "data",
                "points": points,
                "action": action
            }
            self.commands.put(["data", json.dumps(data)])
        else:
            data = {
                "signal": "data",
                "points": points,
                "action": action
            }
            self.data_out.put(data)

    # chart data response from agent
    def update_graph(self, points):
        data = {
            "signal": "update_graph",
            "points": points
        }
        self.commands.put(["update_graph", json.dumps(data)])

    # table data response from agent
    def load_table(self, rows, table_id):
        data = {
            "signal": "load_table",
            "table": table_id,
            "rows": rows
        }
        self.commands.put(["load_table", json.dumps(data)])

    # send GUI list of saved experiment
    def load_experiments(self, experiments):
        data = {
            "signal": "load_experiments",
            "experiments": experiments
        }
        self.commands.put(["load_experiments", json.dumps(data)])

    # send GUI indication that the upload was a success
    def upload_success(self, name):
        data = {
            "signal": "upload_success",
            "name": name
        }
        self.commands.put(["upload_success", json.dumps(data)])

    # exit
    def exit(self):
        pass

    # download waveform to device
    def download(self):
        pass

    # get version command sent from GUI 
    def get_version(self):
        pass

    # save experiment command sent from GUI 
    def save_experiment(self):
        pass

    # get experiments command sent from GUI 
    def get_experiments(self):
        pass

    # request table command sent from GUI 
    def request_table(self, table_id, position):
        pass

    # open experiment command sent from GUI 
    def open_experiment(self, name):
        pass

    # create experiment command sent from GUI 
    def create_experiment(self, name):
        pass

    # delete experiment command sent from GUI 
    def delete_experiment(self, name):
        pass

    # allows user to upload their own experiment files
    def upload_file(self, name, contents):
        pass

    # add pattern command sent from GUI 
    def add_pattern(self, start_value, end_value, rate, duration, repeat_value):
        pass

    # delete pattern command sent from GUI 
    def delete_pattern(self, positions):
        pass

    # move pattern command sent from GUI 
    def move_pattern(self, position, destination):
        pass

    # update pattern command sent from GUI 
    def update_pattern(self, repeat_value, position):
        pass

    # add segment command sent from GUI 
    def add_segment(self, start_value, end_value, rate, duration, repeat_value, position):
        pass

    # delete segment command sent from GUI 
    def delete_segment(self, positions):
        pass

    # move segment command sent from GUI 
    def move_segment(self, position, destination):
        pass

    # update segment command sent from GUI 
    def update_segment(self, start_value, end_value, rate, duration, repeat_value, position):
        pass

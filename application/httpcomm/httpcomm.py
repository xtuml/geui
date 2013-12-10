import agent.thread
import Queue
import server
import json

import eihttp

class HTTPcomm(agent.thread.Thread, eihttp.EIhttp):

    # reference variable for agent
    agent = None

    # reference variable for command line
    command = None

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
        self.command.server = self.server
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
        self.agent.q.put([self.agent.exit])

    # download waveform to device
    def download(self):
        self.agent.q.put([self.agent.download])

    # run the experiment
    def run_experiment(self):
        self.agent.q.put([self.agent.run_experiment])

    # get version command sent from GUI 
    def get_version(self):
        self.agent.q.put([self.agent.get_version])

    # save experiment command sent from GUI 
    def save_experiment(self):
        self.agent.q.put([self.agent.save_experiment])

    # get experiments command sent from GUI 
    def get_experiments(self):
        self.agent.q.put([self.agent.get_experiments])

    # request table command sent from GUI 
    def request_table(self, table_id, position):
        self.agent.q.put([self.agent.request_table, table_id, position])

    # open experiment command sent from GUI 
    def open_experiment(self, name):
        self.agent.q.put([self.agent.open_experiment, name])

    # create experiment command sent from GUI 
    def create_experiment(self, name):
        self.agent.q.put([self.agent.create_experiment, name])

    # delete experiment command sent from GUI 
    def delete_experiment(self, name):
        self.agent.q.put([self.agent.delete_experiment, name])

    # allows user to upload their own experiment files
    def upload_file(self, name, contents):
        self.agent.q.put([self.agent.upload_file, name, contents])

    # add pattern command sent from GUI 
    def add_pattern(self, start_value, end_value, rate, duration, repeat_value):
        self.agent.q.put([self.agent.add_pattern, start_value, end_value, rate, duration, repeat_value])

    # delete pattern command sent from GUI 
    def delete_pattern(self, positions):
        self.agent.q.put([self.agent.delete_pattern, positions])

    # move pattern command sent from GUI 
    def move_pattern(self, position, destination):
        self.agent.q.put([self.agent.move_pattern, position, destination])

    # update pattern command sent from GUI 
    def update_pattern(self, repeat_value, position):
        self.agent.q.put([self.agent.update_pattern, position])

    # add segment command sent from GUI 
    def add_segment(self, start_value, end_value, rate, duration, position):
        self.agent.q.put([self.agent.add_segment, start_value, end_value, rate, duration, position])

    # delete segment command sent from GUI 
    def delete_segment(self, positions, pattern):
        self.agent.q.put([self.agent.delete_segment, positions, pattern])

    # move segment command sent from GUI 
    def move_segment(self, position, destination, pattern):
        self.agent.q.put([self.agent.move_segment, position, destination, pattern])

    # update segment command sent from GUI 
    def update_segment(self, start_value, end_value, rate, duration, repeat_value, position):
        self.agent.q.put([self.agent.update_segment, start_value, end_value, rate, duration, repeat_value, position])

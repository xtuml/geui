# --------------------------------------------------------------------------------------------- #
#   httpcomm.py                                                                                 #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * HTTPcomm                                                                              #
# --------------------------------------------------------------------------------------------- #

import agent.thread
import Queue
import server
import json
import logging
import time

import eihttp

# --------------------------------------------------------------------------------------------- #
#   HTTPcomm class                                                                              #
#       * Subclass of Thread                                                                    #
#       * Implements EIhttp interface                                                           #
#                                                                                               #
#   The HTTPcomm class takes care of all communication between the Agent and the GUI using a    #
#   small web server (web.py). All commands are just added to the command queue and they are    #
#   automatically sent.                                                                         #
# --------------------------------------------------------------------------------------------- #
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

    # timer variables
    timer = 0           # if it accumulates to 10 minutes without a command the program will automatically terminate
    autoexit = False    # whether or not to auto exit on timeout
    timeout = 0         # number of milliseconds before idle timeout

    def __init__(self, name="httpcomm"):
        agent.thread.Thread.__init__(self, name=name)
        self.commands = Queue.Queue()
        self.data_out = Queue.Queue()
        self.server = None
        self.block = False
        self.timer = 0
        self.autoexit = False
        self.timeout = 0

    def initialize(self):
        self.server = server.Server(debug=True, httpcomm=self)
        if self.command != None:
            self.command.server = self.server
        self.server.start()

    def check(self):
        if self.timer == self.timeout:
            logger = logging.getLogger("agent_log")
            logger.info("Idle timeout [" + time.ctime() + "]")
            self.exit()
        if self.autoexit:
            self.timer += 10

    def finalize(self):
        self.server.stop()


    #------- Interface Methods -------#

    # version response from agent
    def version(self, version):
        self.timer = 0
        data = {
            "signal": "version",
            "version": version
        }
        self.commands.put(["version", json.dumps(data)])

    # data packet from agent
    def data(self, points, action):
        self.timer = 0
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
        self.timer = 0
        data = {
            "signal": "update_graph",
            "points": points
        }
        self.commands.put(["update_graph", json.dumps(data)])

    # table data response from agent
    def load_table(self, rows, table_id):
        self.timer = 0
        data = {
            "signal": "load_table",
            "table": table_id,
            "rows": rows
        }
        self.commands.put(["load_table", json.dumps(data)])

    # send GUI list of saved experiment
    def load_experiments(self, experiments):
        self.timer = 0
        data = {
            "signal": "load_experiments",
            "experiments": experiments
        }
        self.commands.put(["load_experiments", json.dumps(data)])

    # send GUI indication that the upload was a success
    def upload_success(self, name):
        self.timer = 0
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
        self.timer = 0
        self.agent.q.put([self.agent.download])

    # run the experiment
    def run_experiment(self):
        self.timer = 0
        self.agent.q.put([self.agent.run_experiment])

    # get version command sent from GUI 
    def get_version(self):
        self.timer = 0
        self.agent.q.put([self.agent.get_version])

    # save experiment command sent from GUI 
    def save_experiment(self):
        self.timer = 0
        self.agent.q.put([self.agent.save_experiment])

    # get experiments command sent from GUI 
    def get_experiments(self):
        self.timer = 0
        self.agent.q.put([self.agent.get_experiments])

    # request table command sent from GUI 
    def request_table(self, table_id, position):
        self.timer = 0
        self.agent.q.put([self.agent.request_table, table_id, position])

    # open experiment command sent from GUI 
    def open_experiment(self, name):
        self.timer = 0
        self.agent.q.put([self.agent.open_experiment, name])

    # create experiment command sent from GUI 
    def create_experiment(self, name):
        self.timer = 0
        self.agent.q.put([self.agent.create_experiment, name])

    # delete experiment command sent from GUI 
    def delete_experiment(self, name):
        self.timer = 0
        self.agent.q.put([self.agent.delete_experiment, name])

    # allows user to upload their own experiment files
    def upload_file(self, name, contents):
        self.timer = 0
        self.agent.q.put([self.agent.upload_file, name, contents])

    # add pattern command sent from GUI 
    def add_pattern(self, start_value, end_value, rate, duration, repeat_value):
        self.timer = 0
        self.agent.q.put([self.agent.add_pattern, start_value, end_value, rate, duration, repeat_value])

    # delete pattern command sent from GUI 
    def delete_pattern(self, positions):
        self.timer = 0
        self.agent.q.put([self.agent.delete_pattern, positions])

    # move pattern command sent from GUI 
    def move_pattern(self, position, destination):
        self.timer = 0
        self.agent.q.put([self.agent.move_pattern, position, destination])

    # update pattern command sent from GUI 
    def update_pattern(self, repeat_value, position):
        self.timer = 0
        self.agent.q.put([self.agent.update_pattern, repeat_value, position])

    # add segment command sent from GUI 
    def add_segment(self, start_value, end_value, rate, duration, position):
        self.timer = 0
        self.agent.q.put([self.agent.add_segment, start_value, end_value, rate, duration, position])

    # delete segment command sent from GUI 
    def delete_segment(self, positions, pattern):
        self.timer = 0
        self.agent.q.put([self.agent.delete_segment, positions, pattern])

    # move segment command sent from GUI 
    def move_segment(self, position, destination, pattern):
        self.timer = 0
        self.agent.q.put([self.agent.move_segment, position, destination, pattern])

    # update segment command sent from GUI 
    def update_segment(self, start_value, end_value, rate, duration, repeat_value, position):
        self.timer = 0
        self.agent.q.put([self.agent.update_segment, start_value, end_value, rate, duration, repeat_value, position])
# --------------------------------------------------------------------------------------------- #

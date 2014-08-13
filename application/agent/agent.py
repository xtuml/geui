# --------------------------------------------------------------------------------------------- #
#   agent.py                                                                                    #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * Agent                                                                                 #
#       * ExperimentList                                                                        #
# --------------------------------------------------------------------------------------------- #

from util import toint
import time
import os
import logging

import eicomm.eibus
import httpcomm.eihttp

import gnosis.xml.pickle

import thread
import threading

# --------------------------------------------------------------------------------------------- #
#   Agent class                                                                                 #
#       * Subclass of Thread                                                                    #
#       * Implements the eibus and eihttp interfaces                                            #
#                                                                                               #
#   Agent is the hub of the entire server side application. It is responsible for maintaining   #
#   the current experiment, saving and opening experiments, as well as all control and          #
#   security oriented functionality.                                                            #
# --------------------------------------------------------------------------------------------- #
class Agent(thread.Thread, eicomm.eibus.EIbus, httpcomm.eihttp.EIhttp):

    # references to other threads
    eicomm = None
    httpcomm = None
    command = None

    # current experiment
    current_experiment = None

    # list of experiment names
    experiment_list = None
    
    def __init__(self, name="agent"):
        thread.Thread.__init__(self, name=name)
        try:
            exp_file = open("experiments/experiments.xml","r")
            xml_string = exp_file.read()
            exp_file.close()
            self.experiment_list = gnosis.xml.pickle.loads(xml_string)
        except IOError:
            self.experiment_list = ExperimentList()

    # called when thread is terminated
    # overwriting from Thread class
    def finalize(self):
        if (self.experiment_list.changed):
            # persist experiment list
            save_file = open("experiments/experiments.xml","w")
            self.experiment_list.changed = False
            save_file.write(gnosis.xml.pickle.dumps(self.experiment_list))
            save_file.close()


    #------- Interface Methods -------#


    # EIBUS
    #---------------------------------#
    # sends the run command to the instrument
    def run_experiment(self):
        if self.eicomm is not None:
            self.eicomm.q.put([self.eicomm.run_experiment])

    # version recevied from instrument. sends version to GUI
    def version(self, data):
        # unmarshall version data
        version = str(data[0]) + "." + str(data[1]) + str(data[2]) + "-" + str(data[3])
        #print "Version: " + version
        if self.httpcomm is not None:
            self.httpcomm.q.put([self.httpcomm.version, version])

    # data packet from EC
    def data(self, data):
        if self.current_experiment.dataFile == None:
            import data_file
            self.current_experiment.dataFile = data_file.DataFile(self.current_experiment)
        self.current_experiment.dataFile.data_packet(data)

    # get version command sent from agent
    def get_version(self):
        pass

    # wave download
    def wave(self, data):
        pass

    # data acquisition download
    def dacq(self, data):
        pass

    # initial conditions download
    def conditions(self, data):
        pass

    #---------------------------------#

    # EIHTTP
    #---------------------------------#
    # exit
    def exit(self):
        self.kill_thread()
        for t in threading.enumerate():
            if t.name == "httpcomm" or t.name == "eicomm" or t.name == "test":
                t.q.put([t.kill_thread])
            self.httpcomm.server.stop()

    # download waveform to device
    def download(self):
        self.current_experiment.graph.translate()
        wave_data = self.current_experiment.wave.marshall()
        dacq_data = self.current_experiment.dataAcquisition.marshall()
        con_data = self.current_experiment.conditions.marshall()
        if self.eicomm is not None:
            self.eicomm.q.put([self.eicomm.wave, wave_data])
            self.eicomm.q.put([self.eicomm.dacq, dacq_data])
            self.eicomm.q.put([self.eicomm.conditions, con_data])

    # get version command sent from GUI 
    def get_version(self):
        if self.eicomm is not None:
            self.eicomm.q.put([self.eicomm.get_version])

    # save experiment command sent from GUI 
    def save_experiment(self):
        if self.current_experiment != None:
            self.current_experiment.save()

    # get experiments command sent from GUI 
    def get_experiments(self):
        return self.experiment_list.names


    # request table command sent from GUI 
    def request_table(self, table_id, position):
        if self.current_experiment != None:
            if table_id == "pattern":
                self.current_experiment.graph.calculate_pattern_params()
            elif table_id == "segment":
                self.current_experiment.graph.contents[position].calculate_segment_params()

    # open experiment command sent from GUI 
    def open_experiment(self, name):
        # import techniques
        import cv

        from experiment import Experiment
        current_experiment = Experiment.open(name)
        # return data to GUI
        if current_experiment != None:
            self.current_experiment = current_experiment
            self.current_experiment.agent = self
            current_experiment.graph.get_points()
            current_experiment.graph.calculate_pattern_params()

        return current_experiment

    # get graph points for current experiment
    def get_points(self):
        return self.current_experiment.graph.get_points()

    # get the graph patterns from the current experiment
    def get_patterns(self):
        return self.current_experiment.graph.calculate_pattern_params()

    # get the graph segments from the current experiment
    def get_segments(self, pattern):
        return self.current_experiment.graph.contents[pattern].calculate_segment_params()

    # create experiment command sent from GUI 
    def create_experiment(self, name):
        from experiment import Experiment
        from cv import CV
        current_experiment = Experiment.create(name, CV)
        self.current_experiment = current_experiment
        self.current_experiment.agent = self
        current_experiment.graph.get_points()
        current_experiment.graph.calculate_pattern_params()

    # delete experiment command sent from GUI 
    def delete_experiment(self, name):
        # remove name from list
        self.experiment_list.names.pop(self.experiment_list.names.index(name))

        # remove file
        os.remove("experiments/"+name+".xml")

    # allows user to upload their own experiment files
    def upload_file(self, name, contents):
        try:
            test_exp = gnosis.xml.pickle.loads(contents)
        except:
            logger = logging.getLogger("agent_log")
            logger.info("Uploaded file wrong format. [" + time.ctime() + "]")
            # send error to GUI here
        else:
            # check for duplicate name
            name_num = 0                        # number of duplicates of that name
            original_name = name
            checking = True
            while checking:
                counter = 0
                for n in self.experiment_list.names:
                    if name == n:
                        name_num += 1
                        name = original_name + "(" + str(name_num) + ")"
                    else:
                        counter += 1
                if counter == len(self.experiment_list.names):
                    checking = False

            # save the file 
            save_file = open("experiments/"+name+".xml","w")
            save_file.write(contents)
            save_file.close()

            # add name to experiment_list
            self.experiment_list.add_experiment(name)

            # send successfull upload message
            if self.httpcomm is not None:
                self.httpcomm.q.put([self.httpcomm.upload_success, name])



    # add pattern command sent from GUI 
    def add_pattern(self, start_value, end_value, rate, duration, repeat_value):
        if self.current_experiment != None:
            E = self.current_experiment 
            old_vertices = list(E.graph.get_vertices())
            E.graph.add_pattern([start_value, end_value, rate, duration, repeat_value])
            E.graph.get_points()
            E.graph.calculate_pattern_params()

    # delete pattern command sent from GUI 
    def delete_pattern(self, positions):
        if self.current_experiment != None:
                E = self.current_experiment 
                old_vertices = list(E.graph.get_vertices())
                for position in positions:
                    E.graph.delete_pattern(position)
                E.graph.get_points()
                E.graph.calculate_pattern_params()

    # move pattern command sent from GUI 
    def move_pattern(self, position, destination):
        if self.current_experiment != None:
            E = self.current_experiment 
            old_vertices = list(E.graph.get_vertices())
            E.graph.move_pattern(position, destination)
            E.graph.get_points()

    # update pattern command sent from GUI 
    def update_pattern(self, repeat_value, position):
        if self.current_experiment != None:
            E = self.current_experiment 
            old_vertices = list(E.graph.get_vertices())
            E.graph.update_pattern(repeat_value, position)
            E.graph.get_points()

    # add segment command sent from GUI 
    def add_segment(self, start_value, end_value, rate, duration, pattern):
        if self.current_experiment != None:
            E = self.current_experiment 
            old_vertices = list(E.graph.get_vertices())
            E.graph.contents[pattern].add_segment([start_value, end_value, rate, duration])
            E.graph.get_points()

    # delete segment command sent from GUI 
    def delete_segment(self, positions, pattern):
        if self.current_experiment != None:
                E = self.current_experiment 
                old_vertices = list(E.graph.get_vertices())
                for position in positions:
                    E.graph.contents[pattern].delete_segment(position)
                E.graph.get_points()

    # move segment command sent from GUI 
    def move_segment(self, position, destination, pattern):
        if self.current_experiment != None:
            E = self.current_experiment 
            old_vertices = list(E.graph.get_vertices())
            E.graph.contents[pattern].move_segment(position, destination)
            E.graph.get_points()

    # update segment command sent from GUI 
    def update_segment(self, start_value, end_value, rate, duration, position, pattern):
        if self.current_experiment != None:
            E = self.current_experiment 
            old_vertices = list(E.graph.get_vertices())
            E.graph.contents[pattern].contents[position].update([start_value, end_value, rate, duration])
            E.graph.get_points()

    # chart data response from agent
    def update_graph(self, points):
        pass

    # table data response from agent
    def load_table(self, rows, table_id):
        pass

    # send GUI list of saved experiment
    def load_experiments(self, names):
        pass

    # send GUI indication that the upload was a success
    def upload_success(self, name):
        pass
# --------------------------------------------------------------------------------------------- #


# --------------------------------------------------------------------------------------------- #
#   ExperimentList class                                                                        #
#                                                                                               #
#   ExperimentList holds the names of the available experiment files. When a new file is        #
#   created, it is added to the list. When the program terminates, the ExperimentList is        #
#   persisted in XML format in experiments/experiments.xml.                                     #
# --------------------------------------------------------------------------------------------- #
class ExperimentList:

    names = []                          # list of strings identifying file names
    changed = True                      # 'dirty bit' flag for marking whether or not the xml
                                        # file needs to be revised

    def __init__(self, names=[]):
        self.names = names
        self.changed = True

    def add_experiment(self, name):
        self.names.append(name)
        self.changed = True

    def remove_experiment(self, name):
        self.names.pop(self.names.index(name))
        self.changed = True
# --------------------------------------------------------------------------------------------- #

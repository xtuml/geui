# Main server side application

from util import toint
import time
import os
import logging

import eicomm.eibus
import httpcomm.eihttp

import gnosis.xml.pickle

import thread
import threading

class Agent(thread.Thread):

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

    # sends a list of saved experiments to the GUI
    def get_experiments(self):
        for t in threading.enumerate():
            if t.name == "httpcomm":
                t.q.put([httpcomm.eihttp.load_experiments, self.experiment_list.names])

    # requests version from instrument
    def get_version(self):
        for t in threading.enumerate():
            if t.name == "eicomm":
                t.q.put([eicomm.eibus.get_version])
                break

    # version recevied from instrument. sends version to GUI
    def version(self, data):
        # unmarshall version data
        version = str(data[0]) + "." + str(data[1]) + str(data[2]) + "-" + str(data[3])
        print "Version: " + version
        for t in threading.enumerate():
            if t.name == "httpcomm":
                t.q.put([httpcomm.eihttp.version, version])
                break

    #sends waveform to the instrument
    def download(self):
        wave = self.current_experiment.graph.translate()
        data = wave.marshall()
        if self.current_experiment != None:
            self.current_experiment.wave = wave
        for t in threading.enumerate():
            if t.name == "eicomm":
                t.q.put([eicomm.eibus.wave, data])

    # sends the run command to the instrument
    def run_experiment(self):
        for t in threading.enumerate():
            if t.name == "eicomm":
                t.q.put([eicomm.eibus.run])

    def delete_experiment(self, name):
        # remove name from list
        self.experiment_list.names.pop(self.experiment_list.names.index(name))

        # remove file
        os.remove("experiments/"+name+".xml")

    def check_upload(self, name, contents):
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
            for t in threading.enumerate():
                if t.name == "httpcomm":
                    t.q.put([httpcomm.eihttp.upload_success, name])

    # called when thread is terminated
    def finalize(self):
        # persist experiment list
        save_file = open("experiments/experiments.xml","w")
        save_file.write(gnosis.xml.pickle.dumps(self.experiment_list))
        save_file.close()

# object for keeping names of experiments
class ExperimentList:

    names = []

    def __init__(self, names=[]):
        self.names = names

    def add_experiment(self, name):
        self.names.append(name)

    def remove_experiment(self, name):
        self.names.pop(self.names.index(name))

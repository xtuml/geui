import threading
import Queue
from util import call
import time
import os

import eicomm.eibus
import httpcomm.eihttp

import gnosis.xml.pickle
from gnosis.xml.pickle.util import setParanoia
setParanoia(0)

class Agent(threading.Thread):

    #threading attributes
    q = None
    running = None

    #current experiment
    current_experiment = None

    #list of experiment names
    experiment_list = None
    
    def __init__(self, thread_name='agent'):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False
        self.current_experiment = None
        exp_file = open('experiments.xml','r')
        xml_string = exp_file.read()
        exp_file.close()
        self.experiment_list = gnosis.xml.pickle.loads(xml_string)

    def get_experiments(self):
        for t in threading.enumerate():
            if t.name == 'httpcomm':
                t.q.put([httpcomm.eihttp.load_experiments, self.experiment_list.names])

    def get_version(self):
        for t in threading.enumerate():
            if t.name == 'eicomm':
                t.q.put([eicomm.eibus.get_version])
                break

    def version(self, data):
        # unmarshall version data
        version = str(data[0]) + '.' + str(data[1]) + str(data[2]) + '-' + str(data[3])
        print 'Version: ' + version
        for t in threading.enumerate():
            if t.name == 'httpcomm':
                t.q.put([httpcomm.eihttp.version, version])
                break

    def data(self, data, action):
        # unmarshall data
        points = data

        #persist data

        #send data to GUI
        for t in threading.enumerate():
            if t.name == 'httpcomm':
                t.q.put([httpcomm.eihttp.data, points, action])
                break

    def exit(self):
        print 'Exiting...'
        self.q.put([self.kill_thread])
        for t in threading.enumerate():
            if t.name == 'httpcomm' or t.name == 'eicomm' or t.name == 'test':
                t.q.put([t.kill_thread])

    def download(self):
        wave = self.current_experiment.graph.translate()
        data = wave.marshall()
        for t in threading.enumerate():
            if t.name == 'eicomm':
                t.q.put([eicomm.eibus.wave, data])

    def run_experiment(self):
        for t in threading.enumerate():
            if t.name == 'eicomm':
                t.q.put([eicomm.eibus.run])

    def delete_experiment(self, name):
        #remove name from list
        self.experiment_list.names.pop(self.experiment_list.names.index(name))

        #remove file
        os.remove('data/'+name+'.xml')

    def check_upload(self, name, contents):
        try:
            test_exp = gnosis.xml.pickle.loads(contents)
        except:
            print 'Uploaded file wrong format. [' + time.ctime() + ']'
            #send error to GUI here
        else:
            #check for duplicate name
            name_num = 0                        #number of duplicates of that name
            original_name = name
            checking = True
            while checking:
                counter = 0
                for n in self.experiment_list.names:
                    if name == n:
                        name_num += 1
                        name = original_name + '(' + str(name_num) + ')'
                    else:
                        counter += 1
                if counter == len(self.experiment_list.names):
                    checking = False

            #save the file 
            save_file = open('data/'+name+'.xml','w')
            save_file.write(contents)
            save_file.close()

            #add name to experiment_list
            self.experiment_list.add_experiment(name)

            #send successfull upload message
            for t in threading.enumerate():
                if t.name == 'httpcomm':
                    t.q.put([httpcomm.eihttp.upload_success, name])

    def kill_thread(self):
        self.running = False

    def run(self):
        self.running = True
        while self.running:

            #wait for command
            cmd = self.q.get()

            #run command
            call(cmd)

        #persist experiment list
        save_file = open('experiments.xml','w')
        save_file.write(gnosis.xml.pickle.dumps(self.experiment_list))
        save_file.close()

        #log exit
        print 'Exited Agent at [' + time.ctime() + ']'

#object for keeping names of experiments
class ExperimentList:

    names = []

    def __init__(self, names=[]):
        self.names = names

    def add_experiment(self, name):
        self.names.append(name)

    def remove_experiment(self, name):
        self.names.pop(self.names.index(name))

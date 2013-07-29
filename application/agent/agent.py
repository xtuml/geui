import threading
import Queue
from util import call
import time
import eicomm.eibus

class Agent(threading.Thread):

    #threading attributes
    q = None
    running = None

    #container for experiments
    experiments = None
    current_experiment = None
    
    def __init__(self, thread_name='agent'):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False
        self.experiments = []
        self.current_experiment = None

    def version(self, data):
        # unmarshall version data
        version = str(data[0]) + '.' + str(data[1]) + str(data[2]) + '-' + str(data[3])
        print 'Version: ' + version

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

    def select_experiment(self, name):
        for exp in self.experiments:
            if exp.name == name:
                return exp 

    def kill_thread(self):
        self.running = False

    def run(self):
        self.running = True
        while self.running:

            #wait for command
            cmd = self.q.get()

            #run command
            call(cmd)
        print 'Exited Agent at [' + time.ctime() + ']'

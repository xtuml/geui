import threading
import Queue
from util import call

class Agent(threading.Thread):

    #threading attributes
    q = None
    running = None

    #container for experiments
    experiments = None
    
    def __init__(self, thread_name):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False
        self.experiments = []

    def select_experiment(self, name):
        for exp in self.experiments:
            if exp.name == name:
                return exp 

    def kill_agent(self):
        self.running = False

    def run(self):
        self.running = True
        while self.running:

            #wait for command
            cmd = self.q.get()

            #run command
            call(cmd)

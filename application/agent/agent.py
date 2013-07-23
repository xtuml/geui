import threading
import Queue
from util import call

class Agent(threading.Thread):

    #threading attributes
    q = None
    running = None

    #container for experiments
    experiments = None
    current_experiment = None
    
    def __init__(self, thread_name):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False
        self.experiments = []
        self.current_experiment = None

    def exit(self):
        print 'Exiting...'
        self.q.put([self.kill_thread()])
        for t in threading.enumerate():
            if t.name == 'httpcomm' or t.name == 'eicomm':
                t.q.put([t.kill_thread])

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
        print 'Exited Agent'

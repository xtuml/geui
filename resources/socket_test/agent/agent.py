import threading
import Queue
from util import call
import eicomm.eibus

class Agent(threading.Thread):

    #threading attributes
    q = None
    running = None

    def __init__(self, thread_name):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False

    def kill_thread(self):
        self.running = False

    def get_version(self):
        for t in threading.enumerate():
            if t.name == 'eicomm':
                t.q.put([eicomm.eibus.get_version])
                break

    def version(self, version):
        print 'Version: ' + version

    def run(self):
        self.running = True
        while self.running:

            #wait for command
            cmd = self.q.get()

            #run command
            call(cmd)

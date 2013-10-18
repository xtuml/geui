# base class for threads in geui

import threading
import Queue
from util import call
import time
import logging

class Thread(threading.Thread):

    # threading attributes
    q = None
    running = None
    block = True                        # default to wait until there is a command

    def __init__(self, name="thread"):
        threading.Thread.__init__(self, name=name)
        self.q = Queue.Queue()
        self.running = False
        self.block = True

    def kill_thread(self):
        self.running = False

    def run(self):
        self.running = True
        self.initialize()
        while self.running:

            if not self.block:
                # check for command
                if not self.q.empty():
                    cmd = self.q.get()

                    # run command
                    call(cmd)

                # call check function
                self.check()
                    
                # sleep for 10 milliseconds
                time.sleep(0.010)

            else:
                # block for a command
                cmd = self.q.get()

                # run command
                call(cmd)
                self.check()

        self.finalize()
        # log exit
        logger = logging.getLogger("agent_log")
        logger.info("Exited " + self.name + " at [" + time.ctime() + "]")

    # function to be called before loop starts
    def initialize(self):
        pass

    # function to be called every iteration of loop
    def check(self):
        pass

    # function to be called before termination
    def finalize(self):
        pass

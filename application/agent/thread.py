# --------------------------------------------------------------------------------------------- #
#   thread.py                                                                                   #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * Thread                                                                                #
# --------------------------------------------------------------------------------------------- #

import threading
import Queue
from util import call
import time
import logging

# --------------------------------------------------------------------------------------------- #
#   Thread class                                                                                #
#       * Subclass of Thread (Python built in version)                                          #
#                                                                                               #
#   The Thread class provides a template for how multithreading is used in this application.    #
#   Each thread has a thread safe queue in which other threads can place function calls.        #
#   The thread initailizes, then begins a loop until it is marked for termination. In the loop  #
#   It checks the queue for commands, then runs the check() method to allow for other loop      #
#   functionality. When it is marked for termination, it finalizes and then terminates.         #
#   Threads can be either blocking or non-blocking. Blocking threads will check the command     #
#   queue and wait if there is no command. Non-blocking threads will check the queue, but if    #
#   there is no command, they will continue the loop after sleeping for 10 milliseconds.        #
# --------------------------------------------------------------------------------------------- #
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
# --------------------------------------------------------------------------------------------- #

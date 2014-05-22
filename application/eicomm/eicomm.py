# --------------------------------------------------------------------------------------------- #
#   eicomm.py                                                                                   #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * EIcomm                                                                                #
#       * Transport                                                                             #
# --------------------------------------------------------------------------------------------- #

import threading
import agent.thread
import Queue
from agent.util import call
from agent.util import tobytes
import time
import socket
import logging

import eibus

# --------------------------------------------------------------------------------------------- #
#   EIcomm class                                                                                #
#       * Subclass of Thread                                                                    #
#       * Implements EIbus interface                                                            #
#                                                                                               #
#   The EIcomm class handles all communication with the EC. It takes a string of bytes and an   #
#   op code and sends the message through the transport layer. When it receives a message, it   #
#   makes the correct function call to the eibus interface.                                     #
# --------------------------------------------------------------------------------------------- #
class EIcomm(agent.thread.Thread, eibus.EIbus):

    # reference variable for agent
    agent = None

    # incoming codes and information
    incoming = None

    # outgoing codes and information (static attribute)
    outgoing = None

    # transport layer
    # takes care of all sending and receiving
    transport = None

    def __init__(self, name="eicomm", s=None):
        agent.thread.Thread.__init__(self, name=name)
        self.setCodes()
        self.block = False
        self.transport = Transport(s)

    def setCodes(self):
        # incoming codes and information (static attribute)
        self.incoming = [
            None,                                   # 0
            {                                       # 1
                "name": "version",
                "method": self.version
            },
            None,                                   # 2
            None,                                   # 3
            None,                                   # 4
            None,                                   # 5
            None,                                   # 6
            None,                                   # 7
            None,                                   # 8
            {                                       # 9
                "name": "data",
                "method": self.data
            }
        ]

        # outgoing codes and information (static attribute)
        self.outgoing = [
            None,                                   # 0
            {"name": "get_version"},                # 1
            None,                                   # 2
            {"name": "run"},                        # 3
            None,                                   # 4
            None,                                   # 5
            None,                                   # 6
            None,                                   # 7
            None,                                   # 8
            None,                                   # 9
            {"name": "wave"},                       # 10
            {"name": "dacq"},                       # 11
            None,                                   # 12
            None,                                   # 13
            None,                                   # 14
            None,                                   # 15
            None,                                   # 16
            None,                                   # 17
            None,                                   # 18
            None,                                   # 19
            {"name": "conditions"}                  # 20
        ]
            
    def send(self, code, length, data):
        msg = bytearray([code]) + bytearray(tobytes(length, 2)) + data
        if self.transport.s != None:
            self.transport.outbox.put(msg)
            target = self.transport.s.getpeername()
            logger = logging.getLogger("agent_log")
            logger.info("Message sent: '" + self.outgoing[code]["name"] + "' to " + target[0] + ":" + str(target[1]) + " at [" + time.ctime() + "]")
        else:
            logger = logging.getLogger("agent_log")
            logger.info("Message not sent: No EC connected. [" + time.ctime() + "]")

    def receive(self):
        if not self.transport.inbox.empty():
            msg = self.transport.inbox.get()
            sender = self.transport.s.getpeername()
            logger = logging.getLogger("agent_log")
            logger.info("Message received: '" + self.incoming[msg[0]]["name"] + "' from " + sender[0] + ":" + str(sender[1]) + " at [" + time.ctime() + "]")
            if self.agent is not None:
                self.agent.q.put([self.incoming[msg[0]]["method"], bytearray(msg[3:])])

    # function to be called before loop starts
    def initialize(self):
        self.transport.start()

    # function to be called every iteration of loop
    def check(self):
        self.receive()

    # function to be called before termination
    def finalize(self):
        self.transport.kill_thread()

    #------- Interface Methods -------#
    #----- SIGNALS TO EC -----#

    # get version command sent from agent
    def get_version(self):
        self.q.put([self.send, 1, 0, bytearray()])

    # wave download
    def wave(self, data):
        self.q.put([self.send, 10, len(data), data])

    # data acquisition download
    def dacq(self, data):
        self.q.put([self.send, 11, len(data), data])

    # initial conditions download
    def conditions(self, data):
        self.q.put([self.send, 20, len(data), data])

    # run current experiment
    def run_experiment(self):
        self.q.put([self.send, 3, 0, bytearray()])


    #----- SIGNALS TO AGENT -----#

    # version response from EC
    def version(self, data):
        self.agent.q.put([self.agent.version, data])

    # data packet from EC
    def data(self, data):
        self.agent.q.put([self.agent.data, data])
# --------------------------------------------------------------------------------------------- #


# --------------------------------------------------------------------------------------------- #
#   Transport class                                                                             #
#       * Subclass of Thread                                                                    #
#                                                                                               #
#   The Transport class encapsulates the nuts and bolts of message sending and receiving. It    #
#   uses sockets to send and receive messages put in its inbox and outbox.                      #
# --------------------------------------------------------------------------------------------- #
class Transport(threading.Thread):

    # threading attributes
    outbox = None
    inbox = None
    running = None

    # socket
    s = None
    msg = None
    
    def __init__(self, s=None, name="Transport"):
        threading.Thread.__init__(self, name=name)
        self.outbox = Queue.Queue()
        self.inbox = Queue.Queue()
        self.running = False
        self.s = s
        self.msg = bytearray()

    def kill_thread(self):
        if self.s != None:
            self.s.close()
        self.running = False

    def push(self):
        if not self.outbox.empty() and self.s != None:  # check for outgoing messages
            message = self.outbox.get()
            self.s.sendall(message)                     # send message

    def pull(self):
        receiving = True
        while receiving and self.s != None:
            try:
                data = self.s.recv(4096)
            except socket.error, e:                     # socket doesn't have data
                if e.args[1] == "Resource temporarily unavailable":
                    receiving = False
                    continue
                else:
                    logger.info("Error: {" + e + "} at [" + time.ctime() + "]")
            else:
                if len(data) == 0:                      # socket has closed
                    receiving = False
                    target = self.s.getpeername()
                    logger = logging.getLogger("agent_log")
                    logger.info("Connection to " + target[0] + ":" + str(target[1]) + " broken at [" + time.ctime() + "]")
                    self.s = None
                else:                                   # socket has data
                    self.msg += data
                    if len(self.msg) >= 3:              # enough data received to calculate message length
                        msglen = self.msg[2] * 256 + self.msg[1] + 3
                        if len(self.msg) == msglen:     # full message received
                            # add message to inbox
                            self.inbox.put(self.msg)

                            # reset self.msg
                            self.msg = bytearray()
                            receiving = False

    def connect(self):
        # try to make a connection
        s = socket.socket()
        try:
            s.connect(("localhost",9000))
        except socket.error, e:
            if e.args[1] != "Connection refused":
                logger.info("Error: {" + e + "} at [" + time.ctime() + "]")
        else:
            self.s = s
            self.s.setblocking(0)
            target = self.s.getpeername()
            logger = logging.getLogger("agent_log")
            logger.info("Connected to " + target[0] + ":" + str(target[1]) + " at [" + time.ctime() + "]")

    def run(self):
        self.running = True
        # wait for a connection
        while self.s == None and self.running:
            self.connect()
            time.sleep(0.010)
        if self.s != None:
            self.s.setblocking(0)
        while self.running:

            # receive messages
            self.pull()

            # send messages
            self.push()

            # sleep for 10 milliseconds
            time.sleep(0.010)
# --------------------------------------------------------------------------------------------- #

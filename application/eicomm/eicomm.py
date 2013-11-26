import threading
import agent.thread
import Queue
from agent.util import call
from agent.util import tobytes
import time
import logging
import usb.core
import usb.util

import eibus

class EIcomm(agent.thread.Thread, eibus.EIbus):

    # incoming codes and information (static attribute)
    incoming = [
        None,                                   # 0
        {                                       # 1
            "name": "version",
            "method": None
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
            "method": None
        }
    ]

    # outgoing codes and information (static attribute)
    outgoing = [
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

    # transport layer
    # takes care of all sending and receiving
    transport = None

    def __init__(self, name="eicomm", s=None):
        agent.thread.Thread.__init__(self, name=name)
        self.block = False
        self.transport = Transport(s)

    def send(self, code, length, data):
        msg = bytearray([code]) + bytearray(tobytes(length, 2)) + data
        if self.transport.dev != None:
            self.transport.outbox.put(msg)
            logger = logging.getLogger("agent_log")
            logger.info("Message sent: '" + self.outgoing[code]["name"] + "' to USB device at [" + time.ctime() + "]")
        else:
            logger = logging.getLogger("agent_log")
            logger.info("Message not sent: No EC connected. [" + time.ctime() + "]")

    def receive(self):
        if not self.transport.inbox.empty():
            msg = self.transport.inbox.get()
            logger = logging.getLogger("agent_log")
            logger.info("Message received: '" + self.incoming[msg[0]]["name"] + "' from USB device at [" + time.ctime() + "]")
            for t in threading.enumerate():
                if t.name == "agent":
                    self.agent = t
                    t.q.put([self.incoming[msg[0]]["method"], bytearray(msg[3:])])
                    break

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
        pass

    # data packet from EC
    def data(self, data):
        pass


class Transport(threading.Thread):

    # threading attributes
    outbox = None
    inbox = None
    running = None

    # inbound message
    msg = None

    # device info
    dev = None

    VENDOR_ID  = 0x0483             # ST's Vendor ID
    PRODUCT_ID = 0x9999             # pulled out of thin air

    self.EP_IN  = None              # endpoint for receiving messages
    self.EP_OUT = None              # endpoint for sending messages
    
    def __init__(self, dev=None, name="Transport"):
        threading.Thread.__init__(self, name=name)
        self.outbox = Queue.Queue()
        self.inbox = Queue.Queue()
        self.running = False
        self.dev = dev 
        self.msg = bytearray()

    def kill_thread(self):
        self.running = False

    def push(self):
        if not self.outbox.empty() and self.dev != None:  # check for outgoing messages
            message = self.outbox.get()
            self.EP_OUT.write(message)                  # send message

    def pull(self):
        receiving = True
        while receiving and self.dev != None:
            data = dev.read(self.EP_IN.bEndpointAddress, self.EP_IN.wMaxPacketSize)
            if len(data) == 0:                      # no data
                receiving = False
            else:                                   # usb has data
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
        # find our device
        dev = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)

        logger = logging.getLogger("agent_log")

        if dev is not None:
            #=====================================================================
            # If the built-in kernel module has already loaded the HID driver, we
            # need to detach it so we can use it.
            #=====================================================================
            if dev.is_kernel_driver_active(0):
                try:
                    dev.detach_kernel_driver(0)
                except usb.core.USBError as e:
                    logger.info("Could not detatch kernel driver: " + str(e) + " at [" + time.ctime() + "]")

            #=====================================================================
            # set_configuration() will use the first configuration which is fine
            # because we only have one.  The reset() initializes everything.
            #=====================================================================
            try:
                dev.set_configuration()
                dev.reset()
            except usb.core.USBError as e:
                logger.info("Could not set configuration: " + str(e) + " at [" + time.ctime() + "]")

            #=====================================================================
            # Set up some shorthand for accessing the endpoints then print some
            # info to the terminal for debugging.
            #=====================================================================
            self.EP_IN  = dev[0][(0,0)][0]
            self.EP_OUT = dev[0][(0,0)][1]

            self.dev = dev
            logger.info("Connected to USB device at [" + time.ctime() + "]")

    def run(self):
        self.running = True
        # wait for a connection
        while self.dev == None and self.running:
            self.connect()
            time.sleep(0.010)
        while self.running:

            # receive messages
            self.pull()

            # send messages
            self.push()

            # sleep for 10 milliseconds
            time.sleep(0.010)


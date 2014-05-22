# loopback for socket tests

from eicomm.eicomm import EIcomm
import threading
import time
import socket

class Demo(threading.Thread):

    eicomm = None
    running = None

    s = None
    connected = None

    def __init__(self, thread_name="eicomm", eicomm=None):
        threading.Thread.__init__(self, name=thread_name)
        self.eicomm = eicomm
        self.running = False
        self.s = None
        self.connected = False

    def kill_thread(self):
        self.running = False

    def run(self):
        self.running = True
        connector = Connector(self)
        connector.start()
        print "Type 'help' for command list."
        while self.running:
            x = raw_input()
            if x == "exit":
                print "Exiting..."
                self.running = False
                connector.kill_thread()
                if self.eicomm != None:
                    self.eicomm.kill_thread()
            elif x == "help":
                print "'version' ---> Send version to agent.\n'exit' ---> Quit program.\n'help' ---> Show command help."
            elif x == "version":
                if self.connected:
                    self.eicomm.send(1, 4, bytearray([2,6,1,3]))
                else:
                    print "Not connected to agent."
            else:
                print "No command '" + x + "'"
        print "Exited Demo at [" + time.ctime() + "]"

class Connector(threading.Thread):

    running = None
    demo = None

    def __init__(self, demo, thread_name="conn"):
        threading.Thread.__init__(self, name=thread_name)
        self.running = False
        self.demo = demo

    def kill_thread(self):
        self.running = False

    def connect(self, s):
        try:
            (c, adrr) = s.accept()
        except socket.error, e:
            if e.args[1] != "Resource temporarily unavailable":
                print e
        else:
            self.demo.s = c
            eicomm = EIcommLoopback(s=self.demo.s)
            self.demo.eicomm = eicomm
            eicomm.start()
            self.demo.connected = True
            target = self.demo.s.getpeername()
            print "Connected to " + target[0] + ":" + str(target[1]) + " at [" + time.ctime() + "]"

    def run(self):
        self.running = True
        s = socket.socket()
        s.setblocking(0)
        print "Binding..."
        bound = False
        while self.running and not bound:
            try:
                s.bind(("localhost",9000))
            except socket.error, e:
                if e.args[1] != "Address already in use":
                    print e
                time.sleep(0.010)
            else:
                s.listen(1)
                print "Listening..."
                bound = True
        while self.running and self.demo.s == None:
            # try to connect
            self.connect(s)
            # sleep for 10 milliseconds
            time.sleep(0.010)
        print "Exited Connector at [" + time.ctime() + "]"

class EIcommLoopback(EIcomm):

    def __init__(self, name="eicomm", s=None):
        EIcomm.__init__(self, name, s)
        # incoming codes and information (static attribute)
        self.incoming = [
            None,                               # 0
            {                                   # 1
                "name": "get_version",
                "method": self.get_version
            },
            None,                               # 2
            {                                   # 3
                "name": "run",
                "method": self.run_exp
            },
            None,                               # 4
            None,                               # 5
            None,                               # 6
            None,                               # 7
            None,                               # 8
            None,                               # 9
            {                                   # 10
                "name": "wave",
                "method": self.wave
            }
        ]

        # outgoing codes and information (static attribute)
        self.outgoing = [
            None,                                   # 0
            {"name": "version"},                    # 1
        ]

    def receive(self):
        if not self.transport.inbox.empty():
            msg = self.transport.inbox.get()
            sender = self.transport.s.getpeername()
            print "Message received: '" + self.incoming[msg[0]]["name"] + "' from " + sender[0] + ":" + str(sender[1]) + " at [" + time.ctime() + "]"
            self.incoming[msg[0]]["method"](bytearray(msg[3:]))

    def get_version(self, data):
        self.send(1, 4, bytearray([2,6,1,3]))
    
    def run_exp(self, data):
        print "Running Experiment."

    def wave(self, data):
        print "Recieved wave:"
        wave = []
        for byte in data:
            wave.append(byte)
        print wave

if __name__ == "__main__":

    demo = Demo("demo")
    demo.start()

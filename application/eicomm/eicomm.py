#virtual eicomm for socket test

import threading
import Queue
from agent.util import call
import time
import socket
import signals

class EIcomm(threading.Thread):

    #incoming codes and corresponding classes
    codes = [None,signals.version]

    #threading attributes
    q = None
    running = None

    #queue for signals
    signals = None

    #transport layer
    transport = None

    def __init__(self, thread_name):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False
        self.signals = Queue.Queue()
        self.transport = None

    def kill_thread(self):
        self.transport.kill_thread()
        self.running = False

    def handle_signal(self):
        while not self.signals.empty():
            signal = self.signals.get()
            if signal.action == 'pack':
                signal.pack()
                self.transport.messages.put(signal.data)
            else:
                signal.unpack()
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put(signal.cmd)

    def run(self):
        self.running = True
        self.transport = Transport('transport')
        self.transport.start()
        while self.running:

            #wait for command
            cmd = self.q.get()

            #run command
            call(cmd)
        print 'Exited EIcomm'

class Transport(threading.Thread):

    #threading attributes
    messages = None
    running = None

    #socket
    s = None
    msg = None
    
    def __init__(self, thread_name, s=None):
        threading.Thread.__init__(self, name=thread_name)
        self.messages = Queue.Queue()
        self.running = False
        self.s = s
        self.msg = bytearray()

    def kill_thread(self):
        if self.s != None:
            self.s.close()
        self.running = False

    def send(self):
        if not self.messages.empty():
            self.s.sendall(self.messages.get(False))
            print 'message sent'

    def receive(self):
        receiving = True
        while receiving:
            try:
                data = self.s.recv(4096)
            except socket.error, e:
                if e.args[1] == 'Resource temporarily unavailable':
                    receiving = False
                    continue
                else:
                    print e
            else:
                if len(data) == 0:
                    receiving = False
                    self.kill_thread()
                else:
                    self.msg += data
                    if len(self.msg) >= 3:
                        msglen = self.msg[2] * 256 + self.msg[1] + 3
                        if len(self.msg) == msglen:
                            print 'message received'

                            #add signal received to queue
                            for t in threading.enumerate():
                                if t.name == 'eicomm':
                                    t.signals.put(EIcomm.codes[self.msg[0]](data=self.msg))
                                    t.q.put([t.handle_signal])

                            self.msg = bytearray()
                            receiving = False

    def connect(self):
        s = socket.socket()
        try:
            s.connect(('localhost',9000))
        except socket.error, e:
            if e.args[1] != 'Connection refused':
                print e
        else:
            self.s = s
            self.s.setblocking(0)
            print 'Connected'

    def run(self):
        self.running = True
        while self.s == None and self.running:
            self.connect()
            time.sleep(0.010)
        while self.running:

            #receive messages
            #print 'receiving...'
            self.receive()

            #send messages
            #print 'sending...'
            self.send()

            #sleep for 10 milliseconds
            #print 'sleeping...'
            time.sleep(0.010)


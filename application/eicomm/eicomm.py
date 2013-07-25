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
    #takes care of all sending and receiving
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
            #handle outgoing signals
            if signal.action == 'pack':
                signal.pack()                               #pack the signal
                self.transport.messages.put([signal.name, signal.data])    #add the signal to transport layer
            #handle incoming signals
            else:
                signal.unpack()                             #unpack the signal
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put(signal.cmd)                 #add eibus call to agent thread

    def run(self):
        self.running = True
        self.transport = Transport('transport')
        self.transport.start()                              #start transport layer
        while self.running:

            #wait for command
            cmd = self.q.get()

            #run command
            call(cmd)
        print 'Exited EIcomm at [' + time.ctime() + ']'

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
        if not self.messages.empty():                   #check for outgoing messages
            message = self.messages.get(False)
            target = self.s.getpeername()
            self.s.sendall(message[1])                  #send message
            print 'Message sent: "' + message[0] + '" to ' + target[0] + ':' + str(target[1]) + ' at [' + time.ctime() + ']'

    def receive(self):
        receiving = True
        while receiving:
            try:
                data = self.s.recv(4096)
            except socket.error, e:                     #socket doesn't have data
                if e.args[1] == 'Resource temporarily unavailable':
                    receiving = False
                    continue
                else:
                    print e
            else:
                if len(data) == 0:                      #socket has closed
                    receiving = False
                    for t in threading.enumerate():
                        if t.name == 'eicomm':
                            t.q.put([t.kill_thread])
                else:                                   #socket has data
                    self.msg += data
                    if len(self.msg) >= 3:              #enough data received to calculate message length
                        msglen = self.msg[2] * 256 + self.msg[1] + 3
                        if len(self.msg) == msglen:     #full message received
                            #create signal
                            signal = EIcomm.codes[self.msg[0]](data=self.msg)
                            sender = self.s.getpeername()

                            print 'Message received: "' + signal.name + '" from ' + sender[0] + ':' + str(sender[1]) + ' at [' + time.ctime() + ']'

                            #add signal received to queue
                            for t in threading.enumerate():
                                if t.name == 'eicomm':
                                    t.signals.put(signal)
                                    t.q.put([t.handle_signal])

                            #reset self.msg
                            self.msg = bytearray()
                            receiving = False

    def connect(self):
        #try to make a connection
        s = socket.socket()
        try:
            s.connect(('localhost',9000))
        except socket.error, e:
            if e.args[1] != 'Connection refused':
                print e
        else:
            self.s = s
            self.s.setblocking(0)
            target = self.s.getpeername()
            print 'Connected to ' + target[0] + ':' + str(target[1]) + ' at [' + time.ctime() + ']'

    def run(self):
        self.running = True
        #wait for a connection
        while self.s == None and self.running:
            self.connect()
            time.sleep(0.010)
        while self.running:

            #receive messages
            self.receive()

            #send messages
            self.send()

            #sleep for 10 milliseconds
            time.sleep(0.010)


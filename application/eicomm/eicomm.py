import threading
import Queue
from agent.util import call
from agent.util import tobytes
import time
import socket
import agent.eibus

class EIcomm(threading.Thread):

    #incoming codes and information (static attribute)
    incoming = [
        None,
        {
            'name': 'version',
            'method': agent.eibus.version
        }
    ]

    #outgoing codes and information (static attribute)
    outgoing = [
        None,                                   # 0
        {'name': 'get_version'},                # 1
        None,                                   # 2
        None,                                   # 3
        None,                                   # 4
        None,                                   # 5
        None,                                   # 6
        None,                                   # 7
        None,                                   # 8
        None,                                   # 9
        {'name': 'wave'}                        # 10
    ]

    #threading attributes
    q = None
    running = None

    #transport layer
    #takes care of all sending and receiving
    transport = None

    def __init__(self, thread_name='eicomm', s=None):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False
        self.transport = Transport(s)

    def kill_thread(self):
        self.transport.kill_thread()
        self.running = False

    def send(self, code, length, data):
        msg = bytearray([code]) + bytearray(tobytes(length, 2)) + data
        if self.transport.s != None:
            self.transport.outbox.put(msg)
            target = self.transport.s.getpeername()
            print 'Message sent: "' + self.outgoing[code]['name'] + '" to ' + target[0] + ':' + str(target[1]) + ' at [' + time.ctime() + ']'
        else:
            print 'Message not sent: No EC connected. [' + time.ctime() + ']'

    def receive(self):
        if not self.transport.inbox.empty():
            msg = self.transport.inbox.get()
            sender = self.transport.s.getpeername()
            print 'Message received: "' + self.incoming[msg[0]]['name'] + '" from ' + sender[0] + ':' + str(sender[1]) + ' at [' + time.ctime() + ']'
            for t in threading.enumerate():
                if t.name == 'agent':
                    t.q.put([self.incoming[msg[0]]['method'], bytearray(msg[3:])])
                    break

    def run(self):
        self.running = True
        self.transport.start()                              #start transport layer
        while self.running:

            #check for command
            if not self.q.empty():
                cmd = self.q.get()
                #run command
                call(cmd)

            #check inbox
            self.receive()

            #sleep for 10 milliseconds
            time.sleep(0.010)

        print 'Exited EIcomm at [' + time.ctime() + ']'

class Transport(threading.Thread):

    #threading attributes
    outbox = None
    inbox = None
    running = None

    #socket
    s = None
    msg = None
    
    def __init__(self, s=None, thread_name='transport'):
        threading.Thread.__init__(self, name=thread_name)
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
        if not self.outbox.empty():                     #check for outgoing messages
            message = self.outbox.get()
            self.s.sendall(message)                     #send message

    def pull(self):
        if self.s != None:
            receiving = True
        else:
            receiving = False
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
                    target = self.s.getpeername()
                    print 'Connection to ' + target[0] + ':' + str(target[1]) + ' broken at [' + time.ctime() + ']'
                    self.s = None
                else:                                   #socket has data
                    self.msg += data
                    if len(self.msg) >= 3:              #enough data received to calculate message length
                        msglen = self.msg[2] * 256 + self.msg[1] + 3
                        if len(self.msg) == msglen:     #full message received
                            #add message to inbox
                            self.inbox.put(self.msg)

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
            self.pull()

            #send messages
            self.push()

            #sleep for 10 milliseconds
            time.sleep(0.010)


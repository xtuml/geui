#socket loopback

import socket
import time
import threading
import Queue


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

    def kill_transport(self):
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
                    self.kill_transport()
                    print 'Exiting...'
                else:
                    self.msg += data
                    if len(self.msg) >= 3:
                        msglen = self.msg[2] * 256 + self.msg[1] + 3
                        if len(self.msg) == msglen:
                            print 'message received'

                            #loopback version command [Version: 2.61-3]
                            if self.msg[0] == 1:
                                self.messages.put(bytearray([0x01,0x04,0x00,0x02,0x06,0x01,0x03]))

                            self.msg = bytearray()
                            receiving = False

    def connect(self):
        self.s = socket.socket()
        self.s.connect(('localhost',9000))

    def run(self):
        self.running = True
        if self.s == None:
            self.connect()
        self.s.setblocking(0)
        #demo = Demo('demo', self)
        #demo.start()
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

class Demo(threading.Thread):

    transport = None
    running = None

    def __init__(self, thread_name, transport):
        threading.Thread.__init__(self, name=thread_name)
        self.transport = transport
        self.running = False

    def run(self):
        self.running = True
        while self.running:
            x = raw_input('<Enter> to send version\n')
            if x == 'exit':
                print 'Exiting...'
                self.running = False
                self.transport.kill_transport()
            else:
                self.transport.messages.put(bytearray([0x01,0x04,0x00,0x02,0x06,0x01,0x03]))


if __name__ == '__main__':
    s = socket.socket()
    s.bind(('localhost',9000))
    s.listen(1)
    print 'Listening for connections...'
    (c, adrr) = s.accept()
    print 'Connected'

    transport = Transport('transport',c)
    transport.start()

from httpcomm.httpcomm import HTTPcomm
from agent.agent import Agent
from eicomm.eicomm import EIcomm
from agent.test_bench import TestBench

import agent.eihttp as eihttp

import threading
import time
import re

#thread for executing commands
class CommandLine(threading.Thread):
    
    running = None

    commands = [
        '"run" ---> Run current experiment.',
        '"test_data" ---> Send test data to GUI.',
        '"send_wave" ---> Send test wave from test bench to EC.',
        '"get_version" ---> Send get_version request to EC.',
        '"exit" ---> Quit program.',
        '"help" ---> Show command help.'
    ]

    def __init__(self, thread_name='command'):
        threading.Thread.__init__(self, name=thread_name)
        self.running = False

    def run(self):
        self.running = True
        print 'Type "help" for command list.'
        while self.running:
            x = raw_input()
            if x == 'run':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put([t.run_experiment])
                        break
            elif x == 'test_data':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        #graph test
                        print 'Sending test data...'
                        open_file = open('test.txt','r')
                        lines = open_file.readlines()
                        open_file.close()
                        points = [] 
                        for n, point in enumerate(lines):
                            if n % 10 == 0:
                                p = point.rsplit(', ')
                                points.append([float(p[0]), float(p[1])])

                        print len(points)

                        #send data
                        c = 0
                        rate = 10                               #updates per second
                        iterations = rate * 16                  #updates in 16s
                        pack_size = len(points) / iterations    #number of points in each packet
                        while c < iterations:
                            data = points[c * pack_size:(c + 1) * pack_size]
                            t.q.put([t.data, data])
                            c += 1
                            time.sleep(1 / float(rate))
                        print 'Done sending test data.'
                        break
            elif x == 'send_wave':
                for t in threading.enumerate():
                    if t.name == 'test':
                        t.q.put([t.send_wave])
                        break
            elif x == 'get_version':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put([t.get_version])
                        break
            elif x == 'exit':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put([t.exit])
                        break
                self.running = False
            elif x == 'help':
                for command in self.commands:
                    print command
            else:
                print 'No command "' + x + '"'
        print 'Exited CommandLine at [' + time.ctime() + ']'


#main method. initializes agent, server, and usblistener
if __name__ == "__main__":
    #define threads
    agent = Agent()
    eicomm = EIcomm()
    httpcomm = HTTPcomm()

    command = CommandLine()
    test = TestBench()

    #start threads
    agent.start()
    eicomm.start()
    httpcomm.start()
    test.start()
    command.start()

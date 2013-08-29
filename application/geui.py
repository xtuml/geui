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
        '"send_wave" ---> Send test wave from test bench to EC.',
        '"get_version" ---> Send get_version request to EC.',
        '"add_segment <args>" ---> Add a segment to the current experiment.',
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
            if x == 'exit':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put([t.exit])
                        break
                self.running = False
            elif x == 'help':
                for command in self.commands:
                    print command
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
            elif re.search('add_segment', x) != None:
                for t in threading.enumerate():
                    if t.name == 'agent':
                        args = x.split(' ')[1:]
                        t.q.put([eihttp.add_segment, float(args[0]), float(args[1]), float(args[2]), float(args[3]), int(args[4]), 1])
            else:
                print 'No command "' + x + '"'
        print 'Exited CommandLine at [' + time.ctime() + ']'


#main method. initializes agent, server, and usblistener
if __name__ == "__main__":

    #setup logging
    import logging
    import logging.handlers

    # create logger with 'spam_application'
    logger = logging.getLogger('agent_log')
    logger.setLevel(logging.INFO)
    # create file handler which logs info messages
    fh = logging.handlers.RotatingFileHandler('log/agent.log', maxBytes=1048576, backupCount=10) # 10 backup files max 1MB each
    fh.setLevel(logging.DEBUG)
    # create console handler
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    # create formatter and add it to the handlers
    formatter = logging.Formatter('%(message)s')
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)
    # add the handlers to the logger
    logger.addHandler(fh)
    logger.addHandler(ch)

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

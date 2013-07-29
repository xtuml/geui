from httpcomm.httpcomm import HTTPcomm
from agent.agent import Agent
from eicomm.eicomm import EIcomm
from agent.test_bench import TestBench

import threading
import time

#thread for executing commands
class CommandLine(threading.Thread):
    
    running = None

    commands = [
        '"send_wave" ---> Send test wave from test bench to EC.',
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

from agent.agent import Agent
from eicomm.eicomm import EIcomm

import threading

class CommandLine(threading.Thread):
    
    running = None
    agent = None

    def __init__(self, thread_name, agent):
        threading.Thread.__init__(self, name=thread_name)
        self.running = False
        self.agent = agent

    def kill_thread(self):
        self.running = False

    def end_program(self):
        print 'Exiting...'
        for t in threading.enumerate():
            if t.name == 'agent' or t.name == 'eicomm':
                t.q.put([t.kill_thread])
        self.kill_thread()

    def run(self):
        self.running = True
        print "\nType 'version' to send 'get_version' command.\nType 'wave' to send 'wave' command.\nType 'exit' to quit.\n"
        while self.running:
            x = raw_input()
            if x == 'version':
                self.agent.q.put([self.agent.get_version])
            elif x == 'wave':
                self.agent.q.put([self.agent.wave])
            elif x == 'exit':
                self.end_program()
            else:
                pass

#main method. initializes agent, server, and usblistener
if __name__ == "__main__":
    #define threads
    agent = Agent('agent')
    eicomm = EIcomm('eicomm')
    cl = CommandLine('cl', agent)

    #start threads
    agent.start()
    eicomm.start()
    cl.start()

from httpcomm.httpcomm import HTTPcomm
from agent.agent import Agent
from eicomm.eicomm import EIcomm
from agent.test_bench import TestBench

#main method. initializes agent, server, and usblistener
if __name__ == "__main__":
    #define threads
    agent = Agent('agent')
    eicomm = EIcomm('eicomm')
    httpcomm = HTTPcomm('httpcomm')

    test = TestBench('test',5)
    #test.test = test.send_wave

    #start threads
    agent.start()
    eicomm.start()
    httpcomm.start()
    test.start()

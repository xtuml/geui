from httpcomm.httpcomm import HTTPcomm
from agent.agent import Agent
from eicomm.eicomm import EIcomm
from agent.test_bench import TestBench
from command import CommandLine


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

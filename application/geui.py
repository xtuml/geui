from httpcomm.httpcomm import HTTPcomm
from agent.agent import Agent
from eicomm.eicomm import EIcomm

#main method. initializes agent, server, and usblistener
if __name__ == "__main__":
    #define threads
    agent = Agent('agent')
    eicomm = EIcomm('eicomm')
    httpcomm = HTTPcomm('httpcomm')

    #start threads
    agent.start()
    eicomm.start()
    httpcomm.start()

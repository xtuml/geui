from httpcomm.server import Server
from agent.agent import Agent

#main method. initializes agent, server, and usblistener
if __name__ == "__main__":
    #define threads
    agent = Agent('agent')
    server = Server('server')

    #start threads
    agent.start()
    server.start()

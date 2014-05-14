from httpcomm.httpcomm import HTTPcomm
from agent.agent import Agent
from eicomm.eicomm import EIcomm
from agent.test_bench import TestBench
from agent.command import CommandLine

import time
import sys

# main method. initializes agent, server, and usb listener
if __name__ == "__main__":

    # initialize command line arguments
    background = False                  # run in background. default is false
    port = 8080                         # port to run server on. default is 8080

    for i, arg in enumerate(sys.argv):
        if (arg == "-p" and i < len(sys.argv) - 1):
            try:                                    # ValueError if not an integer
                port = int(sys.argv[i+1])
            except ValueError:
                port = 8080                         # default
        elif (arg == "-b"):
            background = True

    # reform arg array so webpy can get the right port
    sys.argv = ["geui.py", str(port)]

    # setup logging
    import logging
    import logging.handlers

    # create logger with "spam_application"
    logger = logging.getLogger("agent_log")
    logger.setLevel(logging.INFO)
    # create file handler which logs info messages
    fh = logging.handlers.RotatingFileHandler("log/agent.log", maxBytes=41920, backupCount=10) # 10 backup files max 40KB each
    fh.setLevel(logging.DEBUG)
    # create console handler
    ch = logging.StreamHandler()

    if background:
        ch.setLevel(logging.ERROR)
    else:
        ch.setLevel(logging.INFO)

    # create formatter and add it to the handlers
    formatter = logging.Formatter("%(message)s")
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)
    # add the handlers to the logger
    logger.addHandler(fh)
    logger.addHandler(ch)

    # define threads
    agent = Agent()
    eicomm = EIcomm()
    httpcomm = HTTPcomm()

    command = CommandLine()
    test = TestBench()

    # assign reference variables
    agent.eicomm = eicomm
    agent.httpcomm = httpcomm
    agent.command = command

    eicomm.agent = agent

    httpcomm.agent = agent
    httpcomm.command = command

    command.agent = agent
    command.test = test

    test.httpcomm = httpcomm

    # start threads
    agent.start()
    eicomm.start()
    httpcomm.start()
    test.start()
    command.start()

    logger.info("Agent initiated at [" + time.ctime() + "]")

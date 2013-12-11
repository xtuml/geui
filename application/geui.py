from httpcomm.httpcomm import HTTPcomm
from agent.agent import Agent
from eicomm.eicomm import EIcomm
from agent.test_bench import TestBench
from agent.command import CommandLine

import time

# main method. initializes agent, server, and usb listener
if __name__ == "__main__":

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

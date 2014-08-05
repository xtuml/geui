from httpcomm.httpcomm import HTTPcomm
from agent.agent import Agent
from eicomm.eicomm import EIcomm
from agent.test_bench import TestBench
from agent.command import CommandLine

import time
import sys
import os

# main method. initializes agent, server, and usb listener
if __name__ == "__main__":

    # initialize command line arguments

    #   Usage:                                                                              #
    #                                                                                       #
    #   python geui.py [-b] [-t <timeout in milliseconds>] [-p <port number>]               #

    # ------------------------------------------------------------------------------------- #

    background = False                  # run in background. default is false
    port = 8080                         # port to run server on. default is 8080
    autoexit = False                    # whether or not to exit on idle timeout
    timeout = 600000                    # idle timeout in milliseconds (default ten minutes)

    for i, arg in enumerate(sys.argv):
        if (arg == "-p" and i < len(sys.argv) - 1):
            try:                                    # ValueError if not an integer
                port = int(sys.argv[i+1])
            except ValueError:
                pass
        elif (arg == "-b"):
            background = True

        elif (arg == "-t" and i < len(sys.argv) - 1):
            autoexit = True
            try:
                timeout = int(sys.argv[i+1])
            except ValueError:
                pass

    # timeout has minimum value of 1 second
    if timeout < 1000:
        timeout = 1000

    # reform arg array so webpy can get the right port
    #sys.argv = ["geui.py", str(port)]
    # ------------------------------------------------------------------------------------- #


    # setup logging
    # ------------------------------------------------------------------------------------- #
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
    # ------------------------------------------------------------------------------------- #


    # define threads
    # ------------------------------------------------------------------------------------- #
    agent = Agent()
    eicomm = EIcomm()
    httpcomm = HTTPcomm()
    httpcomm.autoexit = autoexit
    httpcomm.timeout = timeout

    if not background:              # don't initialize commandline if running in background
        command = CommandLine()

    test = TestBench()

    # assign reference variables
    agent.eicomm = eicomm
    agent.httpcomm = httpcomm


    eicomm.agent = agent
    httpcomm.agent = agent

    if not background:              # don't initialize commandline if running in background
        agent.command = command
        httpcomm.command = command
        command.agent = agent
        command.test = test

    test.httpcomm = httpcomm
    # ------------------------------------------------------------------------------------- #



    # fork off (if running in background)
    # ------------------------------------------------------------------------------------- #
    if (background):
        pid = os.fork()
        if pid < 0:
            sys.exit(1)     # unable to fork
        elif pid > 0:
            sys.exit(0)     # exit parent process

        if os.isatty(0):
            os.close(0)         # close stdin
        if os.isatty(1):
            os.close(1)         # close stdout
        if os.isatty(2):
            os.close(2)         # close stderr

    # ------------------------------------------------------------------------------------- #


    # start threads
    # ------------------------------------------------------------------------------------- #
    agent.start()
    eicomm.start()
    httpcomm.start()
    test.start()

    if not background:              # don't initialize commandline if running in background
        command.start()

    logger.info("Agent initiated at [" + time.ctime() + "]")
    # ------------------------------------------------------------------------------------- #

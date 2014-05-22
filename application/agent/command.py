# --------------------------------------------------------------------------------------------- #
#   command.py                                                                                  #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * CommandLine                                                                           #
# --------------------------------------------------------------------------------------------- #

import threading
import thread

# --------------------------------------------------------------------------------------------- #
#   CommandLine class                                                                           #
#       * Subclass of Thread                                                                    #
#                                                                                               #
#   CommandLine is the user's access to the agent application. It blocks, waiting for commands  #
#   from the console.                                                                           #
# --------------------------------------------------------------------------------------------- #
class CommandLine(thread.Thread):
    
    commands = [
        "'run' ---> Run current experiment.",
        "'test_data' ---> Send test data to GUI.",
        "'download' ---> Send current wave to EC.",
        "'get_version' ---> Send get_version request to EC.",
        "'exit' ---> Quit program.",
        "'help' ---> Show command help."
    ]

    # reference variables for threads
    agent = None
    test = None
    server = None       # for httpcomm errors to emergency stop the server

    def __init__(self, name="command"):
        thread.Thread.__init__(self, name=name)
        self.block = False

    # exit the program
    def exit(self):
        print "Exiting..."
        self.kill_thread()
        if self.agent is not None:
            self.agent.q.put([self.agent.exit])

    # override from Thread class    (run on start up)
    def initialize(self):
        print "Type 'help' for command list."

    # override from Thread class    (run every iteration of loop)
    def check(self):
        x = raw_input()             # block for a command
        if x == "run":
            if self.agent is not None:
                self.agent.q.put([self.agent.run_experiment])
        elif x == "test_data":
            if self.test is not None:
                self.test.q.put([self.test.test_data])

        elif x == "download":
            if self.agent is not None:
                self.agent.q.put([self.agent.download])
        elif x == "get_version":
            if self.agent is not None:
                self.agent.q.put([self.agent.get_version])
        elif x == "exit":
            self.exit()
        elif x == "help":
            for command in self.commands:
                print command
        else:
            print "No command '" + x + "'"
# --------------------------------------------------------------------------------------------- #

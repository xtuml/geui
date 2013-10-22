import threading
import thread

# thread for executing commands
class CommandLine(thread.Thread):
    
    commands = [
        "'run' ---> Run current experiment.",
        "'test_data' ---> Send test data to GUI.",
        "'download' ---> Send current wave to EC.",
        "'get_version' ---> Send get_version request to EC.",
        "'exit' ---> Quit program.",
        "'help' ---> Show command help."
    ]

    def __init__(self, name="command"):
        thread.Thread.__init__(self, name=name)
        self.block = False

    # exit the program
    def exit(self):
        print "Exiting..."
        self.kill_thread()
        for t in threading.enumerate():
            if t.name == "httpcomm" or t.name == "eicomm" or t.name == "test" or t.name == "agent":
                t.q.put([t.kill_thread])

    def initialize(self):
        print "Type 'help' for command list."

    def check(self):
        x = raw_input()
        if x == "run":
            for t in threading.enumerate():
                if t.name == "agent":
                    t.q.put([t.run_experiment])
                    break
        elif x == "test_data":
            for t in threading.enumerate():
                if t.name == "test":
                    t.q.put([t.test_data])

        elif x == "download":
            for t in threading.enumerate():
                if t.name == "agent":
                    t.q.put([t.download])
                    break
        elif x == "get_version":
            for t in threading.enumerate():
                if t.name == "agent":
                    t.q.put([t.get_version])
                    break
        elif x == "exit":
            self.exit()
        elif x == "help":
            for command in self.commands:
                print command
            for t in threading.enumerate():
                print t.name
        else:
            print "No command '" + x + "'"

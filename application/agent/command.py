import eihttp as eihttp
import threading
import time
import math

#thread for executing commands
class CommandLine(threading.Thread):
    
    running = None

    commands = [
        '"send_wave" ---> Send test wave from test bench to EC.',
        '"get_version" ---> Send get_version request to EC.',
        '"start_session" ---> Test session start.',
        '"exit" ---> Quit program.',
        '"help" ---> Show command help.'
    ]

    def __init__(self, thread_name='command'):
        threading.Thread.__init__(self, name=thread_name)
        self.running = False

    def run(self):
        self.running = True
        print 'Type "help" for command list.'
        while self.running:
            x = raw_input()
            if x == 'send_wave':
                for t in threading.enumerate():
                    if t.name == 'test':
                        t.q.put([t.send_wave])
                        break
            elif x == 'get_version':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put([t.get_version])
                        break
            elif x == 'start_session':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        key = 9999
                        hashed_key = key + 1
                        t.q.put([t.start_session, 'test_session', hashed_key])
                        break
            elif x == 'exit':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put([t.exit])
                        break
                self.running = False
            elif x == 'help':
                for command in self.commands:
                    print command
            else:
                print 'No command "' + x + '"'
        print 'Exited CommandLine at [' + time.ctime() + ']'



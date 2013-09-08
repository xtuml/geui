import eihttp as eihttp

import threading
import time
import logging
import re
import math

#thread for executing commands
class CommandLine(threading.Thread):
    
    running = None

    commands = [
        '"run" ---> Run current experiment.',
        '"test_data" ---> Send test data to GUI.',
        '"send_wave" ---> Send test wave from test bench to EC.',
        '"download" ---> Send current wave to EC.',
        '"get_version" ---> Send get_version request to EC.',
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
            if x == 'run':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put([t.run_experiment])
                        break
            elif x == 'test_data':
                for t in threading.enumerate():
                    if t.name == 'httpcomm':
                        import httpcomm.eihttp
                        #graph test
                        open_file = open('test.txt','r')
                        lines = open_file.readlines()
                        open_file.close()

                        #calculate points to weed out
                        if len(lines) > 1000:
                            mod = math.ceil(float(len(lines)) / float(1000))
                        else:
                            mod = 1

                        points = [] 
                        for n, point in enumerate(lines):
                            if (n % mod == 0) or (n == 0) or (n == len(lines) - 1):         #only graphs every Nth point, first, and last points
                                p = point.rsplit(', ')
                                points.append([float(p[0]), float(p[1])])

                        #two second delay
                        time.sleep(2)

                        #turn on data listening
                        t.q.put([httpcomm.eihttp.data, [], 'start'])

                        points_sent = 0

                        #send data
                        c = 0
                        rate = 5                                                            #updates per second
                        iterations = rate * 16                                              #updates in 16s
                        pack_size = int(math.ceil(float(len(points)) / float(iterations)))  #number of points in each packet
                        while c < iterations:
                            if (c + 1) * pack_size > len(points):
                                data = points[c * pack_size:len(points)]
                            else:
                                data = points[c * pack_size:(c + 1) * pack_size]
                            t.q.put([httpcomm.eihttp.data, data, ''])
                            points_sent += len(data)
                            time.sleep(1 / float(rate))
                            c += 1

                        #turn off data listening
                        t.q.put([httpcomm.eihttp.data, [], 'stop'])
                        #print points_sent
                        break

            elif x == 'send_wave':
                for t in threading.enumerate():
                    if t.name == 'test':
                        t.q.put([t.send_wave])
                        break
            elif x == 'download':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put([t.download])
                        break
            elif x == 'get_version':
                for t in threading.enumerate():
                    if t.name == 'agent':
                        t.q.put([t.get_version])
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
        logger = logging.getLogger('agent_log')
        logger.info('Exited CommandLine at [' + time.ctime() + ']')

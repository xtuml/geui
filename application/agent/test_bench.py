# --------------------------------------------------------------------------------------------- #
#   test_bench.py                                                                               #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * TestBench                                                                             #
# --------------------------------------------------------------------------------------------- #

import thread
import threading

# --------------------------------------------------------------------------------------------- #
#   TestBench class                                                                             #
#       * Subclass of Thread                                                                    #
#                                                                                               #
#   The TestBench class is designed to run routines to test certain parts of the application.   #
#   It is accessed through the CommandLine class.                                               #
# --------------------------------------------------------------------------------------------- #
class TestBench(thread.Thread):

    # reference to threads
    httpcomm = None

    def __init__(self, name="test"):
        thread.Thread.__init__(self, name=name)

    def test_data(self):
        if self.httpcomm is not None:
            import math
            import time
            import httpcomm.eihttp
            # graph test
            try:
                open_file = open("test.txt","r")
                lines = open_file.readlines()
                open_file.close()
            except IOError:
                lines = []

            # calculate points to weed out
            if len(lines) > 1000:
                mod = math.ceil(float(len(lines)) / float(1000))
            else:
                mod = 1

            points = [] 
            for n, point in enumerate(lines):
                if (n % mod == 0) or (n == 0) or (n == len(lines) - 1):         # only graphs every Nth point, first, and last points
                    p = point.rsplit(", ")
                    points.append([float(p[0]), float(p[1])])

            # two second delay
            time.sleep(2)

            # turn on data listening
            self.httpcomm.q.put([self.httpcomm.data, [], "start"])

            points_sent = 0

            # send data
            c = 0
            rate = 5                                                            # updates per second
            iterations = rate * 16                                              # updates in 16s
            pack_size = int(math.ceil(float(len(points)) / float(iterations)))  # number of points in each packet
            while c < iterations:
                if (c + 1) * pack_size > len(points):
                    data = points[c * pack_size:len(points)]
                else:
                    data = points[c * pack_size:(c + 1) * pack_size]
                self.httpcomm.q.put([self.httpcomm.data, data, ""])
                points_sent += len(data)
                time.sleep(1 / float(rate))
                c += 1

            # turn off data listening
            self.httpcomm.q.put([self.httpcomm.data, [], "stop"])
# --------------------------------------------------------------------------------------------- #

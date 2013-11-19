import thread

import threading

class TestBench(thread.Thread):

    def __init__(self, name="test"):
        thread.Thread.__init__(self, name=name)

    def test_data(self):
        for t in threading.enumerate():
            if t.name == "httpcomm":
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
                t.q.put([t.data, [], "start"])
                print "here"

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
                    t.q.put([t.data, data, ""])
                    points_sent += len(data)
                    time.sleep(1 / float(rate))
                    c += 1

                # turn off data listening
                t.q.put([t.data, [], "stop"])
                # print points_sent
                break

# --------------------------------------------------------------------------------------------- #
#   data_file.py                                                                                #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * DataFile                                                                              #
#       * Point                                                                                 #
# --------------------------------------------------------------------------------------------- #

from util import toint
import threading
import httpcomm

# --------------------------------------------------------------------------------------------- #
#   DataFile class                                                                              #
#                                                                                               #
#   DataFile is an object representation of all the data returned from the device. When a data  #
#   packet is received, it is unpacked and sent to the GUI for display. It is later persisted   #
#   into a signed binary data file.                                                             #
# --------------------------------------------------------------------------------------------- #
class DataFile:

    experiment = None   # reference to the experiment that this datafile is for
    
    N = 0               # number of points in the experiment data file
    range_index = 0     # determins the exponent of the returned I values
    E_exponent = 0      # exponent for voltage. determines units
    timing = 0          # ticks between files

    points = []         # points is an array of Point objects

    def __init__(self, experiment):
        self.experiment = experiment
        self.N = 0
        self.range_index = 0
        self.E_exponent = 0
        self.timing = 0
        self.points = []

    def data_packet(self, packet):

        # unmarshalling grammar definitions
        # data packet is in form (header) (point)*

        n = 0                   # number of points in the packet
        N = 0                   # number of points in the experiment
        start = 0               # starting index of this packet
        range_index = 0         # determins the exponent of the returned I values
        timing = 0              # ticks in between points
        points = []             # data points (16 bit values)

        c = 0                   # current index in data packet

        # unmarshall data
        # unpack header
        n = toint([packet[c], packet[c + 1]])
        N = toint([packet[c + 2], packet[c + 3], packet[c + 4], packet[c + 5]])
        self.N = N                      # update data file
        start = toint([packet[c + 6], packet[c + 7], packet[c + 8], packet[c + 9]])
        range_index = packet[c + 10]
        self.range_index = range_index  # update data file
        timing = packet[c + 11]
        self.timing = timing            # update data file
        c += 12                         # update the counter

        # unpack points
        point_start = c                 # reference index where points start (byte index)
        while c < len(packet):
            E = self.experiment.wave.points[((c - point_start) / 2) + start]
            I = toint([packet[c], packet[c + 1]])
            points.append([E, I])
            self.points.append(Point(E, I))
            c += 2                      # update the counter

        # decide action
        if start == 0 and n == N:
            action = "onepacket"
        elif start == 0:
            action = "start"
        elif start + n == N:
            action = "stop"
        else:
            action = ""

        # diagnostic printing
        # print "n: ", n
        # print "N: ", N
        # print "start: ", start
        # print "range_index: ", range_index
        # print "timing: ", timing
        # print action
        # for point in points:
        #     print point

        # persist data

        # send data to GUI
        if self.experiment is not None and self.experiment.agent is not None and self.experiment.agent.httpcomm is not None:
            self.experiment.agent.httpcomm.q.put([self.experiment.agent.httpcomm.data, points, action])
# --------------------------------------------------------------------------------------------- #


# --------------------------------------------------------------------------------------------- #
#   Point class                                                                                 #
#                                                                                               #
#   The Point class is simply a pairing of a potential value with a current value               #
# --------------------------------------------------------------------------------------------- #
class Point:

    E = 0               # base Voltage value
    I = 0               # corresponding Current value
    
    def __init__(self, E=0, I=0):
        self.E = E
        self.I = I
# --------------------------------------------------------------------------------------------- #

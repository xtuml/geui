# --------------------------------------------------------------------------------------------- #
#   experiment.py                                                                               #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * Experiment                                                                            #
#       * Graph                                                                                 #
# --------------------------------------------------------------------------------------------- #

import threading
import httpcomm.eihttp
import wave
import data_acquisition
import device
import conditions
import gnosis.xml.pickle

# --------------------------------------------------------------------------------------------- #
#   Experiment class                                                                            #
#                                                                                               #
#   The Experiment class is an object representing one distinct experiment that can be run on   #
#   the device. It consists of:                                                                 #
#                                                                                               #
#       * Graph:                GUI friendly representation of the waveform     (varies)        #
#       * InitialConditions:    Header for the experiment                                       #
#       * Wave:                 EC freindly representation of the waveform      (standardized)  #
#       * DataAcquisition:      Specification for taking data                                   #
#       * DataFile:             Object in which to save returned data                           #
#       * Device:               Reference to the device being used                              #
#                                                                                               #
#   The Experiment class is abstract. Each expiriment instance must be an instance of one of    #
#   the more specific experiment subclasses. Each experiment subclass must implement the        #
#   set_parameters() and get_parameters() methods which are used when making changes to the     #
#   experiment through the GUI.                                                                 #
# --------------------------------------------------------------------------------------------- #
class Experiment:

    name = ""                           # name of the experiment
    experimentType = ""                 # experiement type                          (CV, Square wave...)
    tick = 0                            # experiment tick. counts of device tick

    agent = None                        # reference to the agent

    graph = None                        # representation of the UI graph
    conditions = None                   # initial conditions of the experiment
    wave = None                         # mathematical representation of the waveform
    dataAcquisition = None              # data acquisition specification
    dataFile = None                     # data received from the device
    device = None                       # device parameters

    def __init__(self, name=""):
        self.name = name
        self.device = device.Device(1000000, 100)       # 1 MHz fastest tick and 100uV min step (eventually will come from version command)

    # public static method to create an experiment
    @staticmethod
    def create(name, experimentType):
        return experimentType(name)

    # public static method to open an experiment with an experiment name
    @staticmethod
    def open(name):
        # open experiment
        # open a saved file
        try:
            saved_file = open("experiments/"+name+".xml","r")
            xml_string = saved_file.read()
            saved_file.close()
            return gnosis.xml.pickle.loads(xml_string)

        except IOError:
            return None

    # dump to xml file
    def save(self):
        self.agent = None
        # save the file 
        save_file = open("experiments/"+self.name+".xml","w")
        save_file.write(gnosis.xml.pickle.dumps(self))
        save_file.close()

    # takes a dictionary of name/value pairs of the parameters
    def set_parameters(self, parameters):
        raise NotImplementedError

    # returns a dictionary of name/value pairs of the parameters
    def get_parameters(self):
        raise NotImplementedError
# --------------------------------------------------------------------------------------------- #


# --------------------------------------------------------------------------------------------- #
#   Graph class                                                                                 #
#                                                                                               #
#   The Graph class is an object representing the GUI friendly, visual form of the waveform.    #
#   It varies greatly in implementation from experiment to experiment. The Experiment class is  #
#   also abstract. Each experiment must have a graph that inheirits from Graph and implements   #
#   the methods get_points() and translate(). The get_points() method returns a set of (x, y)   #
#   coordinates for the GUI to graph. The translate() method converts the graph into the        #
#   standardized Wave definition to be downloaded to the device.                                #
# --------------------------------------------------------------------------------------------- #
class Graph:

    def get_points(self):
        raise NotImplementedError

    def translate(self, wave_type):
        raise NotImplementedError
# --------------------------------------------------------------------------------------------- #

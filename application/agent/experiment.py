import threading
import httpcomm.eihttp
import wave
import data_acquisition
import device
import conditions
import gnosis.xml.pickle

# data model for an experiment
class Experiment:

    name = ""                           # name of the experiment
    experimentType = ""                 # experiement type, see types variable
    tick = 0                            # experiment tick. counts of device tick

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
        # save the file 
        save_file = open("experiments/"+self.name+".xml","w")
        save_file.write(gnosis.xml.pickle.dumps(self))
        save_file.close()

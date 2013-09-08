#eibus interface for communicating to the embedded code on the device

import httpcomm.eihttp
import threading

#----- SIGNALS TO AGENT -----#

#version response from EC
def version(data):
    t = threading.currentThread()
    t.version(data)

#data packet from EC
def data(data):
    t = threading.currentThread()
    if t.current_experiment.data_file == None:
        import data_file
        t.current_experiment.data_file = data_file.DataFile(t.current_experiment)
    t.current_experiment.data_file.data_packet(data)

#----- SIGNALS TO EC -----#

#get version command sent from agent
def get_version():
    pass

#wave download
def wave(wave_args):
    pass

#run current experiment
def run():
    pass

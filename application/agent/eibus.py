#eibus interface for communicating to the embedded code on the device

import httpcomm.eihttp
import threading

#----- SIGNALS TO AGENT -----#

#version response from EC
def version(data):
    t = threading.currentThread()
    t.version(data)

#----- SIGNALS TO EC -----#

#get version command sent from agent
def get_version():
    pass

#wave download
def wave(wave_args):
    pass

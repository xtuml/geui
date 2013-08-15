#eibus interface for communicating to the embedded code on the device

import httpcomm.eihttp
import threading

#----- SIGNALS TO AGENT -----#

#version response from EC
def version(data):
    t = threading.currentThread()
    t.version(data)

#receive the session increment multiplier from the EC
def session_increment(data):
    t = threading.currentThread()
    t.session_increment(data)

#receive an error message from the EC
def error(data):
    t = threading.currentThread()
    t.error(data)

#----- SIGNALS TO EC -----#

#get version command sent from agent
def get_version():
    pass

#wave download
def wave(wave_args):
    pass

#initiate a session with the EC
def start_session(data):
    pass

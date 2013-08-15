#eibus interface for communicating to the embedded code on the device

import threading
from agent.util import tobytes

#----- SIGNALS TO EC -----#

#get version command sent from agent
def get_version():
    t = threading.currentThread()
    t.q.put([t.send, 1, 0, bytearray()])

#wave download
def wave(data):
    t = threading.currentThread()
    t.q.put([t.send, 10, len(data), data])

#initiate a session with the EC
def start_session(data):
    t = threading.currentThread()
    t.q.put([t.send, 15, len(data), data])

#----- SIGNALS TO AGENT -----#

#version response from EC
def version(data):
    pass

#receive the session increment multiplier from the EC
def session_increment(data):
    pass

#receive an error message from the EC
def error(data):
    pass

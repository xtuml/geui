#eibus interface for communicating to the embedded code on the device

import threading

#get version command sent from agent
def get_version():
    pass

#version response from EC
def version(version):
    t = threading.currentThread()
    t.version(version)

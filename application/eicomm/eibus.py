
#eibus interface for communicating to the embedded code on the device

import threading
import signals

#----- SIGNALS TO EC -----#

#get version command sent from agent
def get_version():
    t = threading.currentThread()
    t.signals.put(signals.get_version())
    t.q.put([t.handle_signal])

#wave download
def wave(wave_args):
    t = threading.currentThread()
    t.signals.put(signals.wave(args=wave_args))
    t.q.put([t.handle_signal])


#----- SIGNALS TO AGENT -----#

#version response from EC
def version(version):
    pass

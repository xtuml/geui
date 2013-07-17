
#eibus interface for communicating to the embedded code on the device

import threading
import signals

#get version command sent from agent
def get_version():
    t = threading.currentThread()
    t.signals.put(signals.get_version())
    t.q.put([t.handle_signal])


#version response from EC
def version(version):
    pass

#eibus interface for communicating to the embedded code on the device

import httpcomm.eihttp
import threading

#get version command sent from agent
def get_version():
    pass

#version response from EC
def version(version):
    print 'Version: ' + version
    for t in threading.enumerate():
        if t.name == 'httpcomm':
            t.q.put([httpcomm.eihttp.version, version])

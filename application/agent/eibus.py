
#eibus interface for communicating to the embedded code on the device

#get version command sent from agent
def get_version():
    pass

#version response from EC
def version(version):
    print 'Version: ' + version

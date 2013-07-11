#eibus interface for communicating to the embedded code on the device
import eicomm.execute

#get version command sent from agent
def get_version():
    #execute command to call Jason's C program
    eicomm.execute.run('./eicomm/ei-ver 1.23')

#version response from EC
def version(version):
    pass

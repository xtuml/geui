#specific signal classes for packing/unpacking in eicomm

import agent.eibus

#--------- TO EC ---------#

class get_version:
    
    code = 1
    action = 'pack'
    data = bytearray()
    args = []
    cmd = []

    def __init__(self, args=[], data=bytearray()):
        self.code = 1
        self.action = 'pack'
        self.data = data
        self.args = args
        self.cmd = []

    def pack(self):
        self.data = bytearray([0x01,0x00,0x00])

    def unpack(self):
        pass

#-------------------------#


#------- TO AGENT --------#

class version:
    
    code = 1
    action = 'unpack'
    data = bytearray()
    args = []
    cmd =[]

    def __init__(self, args=[], data=bytearray()):
        self.code = 1
        self.action = 'unpack'
        self.data = data
        self.args = args
        self.cmd = []

    def pack(self):
        pass

    def unpack(self):
        version = ''
        version = str(self.data[3]) + '.' + str(self.data[4]) + str(self.data[5]) + '-' + str(self.data[6])
        self.cmd = [agent.eibus.version, version]

#-------------------------#

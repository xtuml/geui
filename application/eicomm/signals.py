#specific signal classes for packing/unpacking in eicomm

import agent.eibus

#function to convert an integer to an array of bytes (in integer form 0 <= num < 256)
def tobytes(value, num_bytes, little_endian=True):
    import math
    byte_array = []
    num_need = int(math.ceil(float(math.log(value + 1, 256))))  #find number of bytes needed
    while num_need > 0:
        num_need -= 1                                           #num_need becomes multiplying factor to separate bytes
        byte_array.append(int(math.floor(float(value / (256 ** num_need)))))
        value = value % (256 ** num_need)

    #add empty bytes to fill requirements
    while len(byte_array) < num_bytes:
        byte_array.insert(0, 0)

    #adjust endianness
    if little_endian == True:
        byte_array.reverse()

    return byte_array

#--------- TO EC ---------#

#class example:
    
    #name = 'example'       # name for logging
    #code = 0               # op code to distinguish which command is being sent/received
    #action = 'pack'        # if signal is to EC, this will be 'pack', else, it will be 'unpack'
    #data = bytearray()     # byte data is stored here. in 'pack', data is outgoing. in 'unpack',
                            # data is from the EC
    #args = []              # arguments to pack (all core types)
    #cmd = []               # if action is 'unpack', eibus call to be added to agent thread

#get version request
class get_version:
    
    name = 'get_version'
    code = 1
    action = 'pack'
    data = bytearray()
    args = []
    cmd = []

    def __init__(self, args=[], data=bytearray()):
        self.name = 'get_version'
        self.code = 1
        self.action = 'pack'
        self.data = data
        self.args = args
        self.cmd = []

    def pack(self):
        self.data = bytearray([self.code, 0, 0])

    def unpack(self):
        pass

#send waveform to instrument
class wave:
    
    name = 'wave'
    code = 10
    action = 'pack'
    data = bytearray()
    args = []
    cmd = []

    def __init__(self, args=[], data=bytearray()):
        self.name = 'wave'
        self.code = 10
        self.action = 'pack'
        self.data = data
        self.args = args
        self.cmd = []

    def pack(self):
        msg = []

        length = 0                  # running length of the message
        i = 0                       # index of the current argument

        #pack op code
        msg.append(self.code)
        msg.append(0)               #  dummy length. length is counted
        msg.append(0)               #  during the packing proccess

        #pack wave header
        for byte in tobytes(self.args[i], 2):               #pack waveID
            msg.append(byte)
            length += 1
        i += 1
        for byte in tobytes(self.args[i], 2):               #pack E_final
            msg.append(byte)
            length += 1
        i += 1
        for byte in tobytes(self.args[i], 2):               #pack wave N
            msg.append(byte)
            length += 1
        i += 1
        msg.append(self.args[i])                            #pack wave n
        length += 1
        num_patterns = self.args[i]
        i += 1

        #pack patterns
        p = 0                                               #pattern index
        while p < num_patterns:                             #loop through patterns
            for byte in tobytes(self.args[i], 2):           #pack pattern N
                msg.append(byte)
                length += 1
            i += 1
            msg.append(self.args[i])                        #pack pattern n
            length += 1
            num_segments = self.args[i]
            i += 1

            #pack segments
            s = 0                                           #segment index
            while s < num_segments:                         #loop through segments
                for byte in tobytes(self.args[i], 2):       #pack segment ticks
                    msg.append(byte)
                    length += 1
                i += 1
                for byte in tobytes(self.args[i], 2):       #pack segment n
                    msg.append(byte)
                    length += 1
                num_points = self.args[i]
                i += 1

                #pack points
                v = 0                                       #point value index
                while v < num_points:
                    for byte in tobytes(self.args[i], 2):   #pack point
                        msg.append(byte)
                        length += 1
                    i += 1
                    #increment counter
                    v += 1

                #increment counter
                s += 1

            #increment counter
            p += 1

        length = tobytes(length, 2)
        msg[1] = length[0]
        msg[2] = length[1]
        #print msg
        
        self.data = bytearray(msg)

    def unpack(self):
        pass

#-------------------------#


#------- TO AGENT --------#

#version response from agent
class version:
    
    name = 'version'
    code = 1
    action = 'unpack'
    data = bytearray()
    args = []
    cmd =[]

    def __init__(self, args=[], data=bytearray()):
        self.name = 'version'
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

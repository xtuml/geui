#commands to the device
class Command:
    
    code = 0x00                 #command code
    length = [0x00, 0x00]       #length low endian

    response = True             #expecting a response

    def __init__(self, code=0x00, length=[0x00,0x00], response=True):
        self.code = code
        self.length = length
        self.response = response

    def encode(self, data):
        #take the data and put it into the format for the specific message
        return []

    def parse(self, data):
        #take the return data and put it into something we can read
        pass

    def reset(self):
        #clear out the command data
        self.data = []

class VER(Command):
    
    def __init__(self, code=0x01, length=[0x00,0x00], response=True):
        self.code = code
        self.length = length
        self.response = response

    def parse(self, data):
        #parses a 4 byte response into a version code string
        version_string = ''
        version_string = str(int(data[0])) + '.' + str(int(data[1])) + str(int(data[2])) + '-' + str(int(data[3]))
        return version_string

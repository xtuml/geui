# Model of the initial conditions package to be sent down to the device
# before a run

from util import tobytes

class InitialConditions:

    tick = 0                # experiment tick defined by the server
    range_index = 0         # index for range setting
    filter_index = 0        # index for filter setting
    E_offset = 0            # voltage offset in counts * 100uV

    def __init__(self, tick, range_index, filter_index, E_offset):
        self.tick = int(tick)
        self.range_index = range_index
        self.filter_index = filter_index
        self.E_offset = E_offset

    def marshall(self):
        data = []

        data += tobytes(self.tick, 2)
        data += tobytes(self.range_index, 1)
        data += tobytes(self.filter_index, 1)
        data += tobytes(self.E_offset, 2)

        return bytearray(data)

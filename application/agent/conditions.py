# --------------------------------------------------------------------------------------------- #
#   conditions.py                                                                               #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * InitialConditions                                                                     #
# --------------------------------------------------------------------------------------------- #

from util import tobytes

# --------------------------------------------------------------------------------------------- #
#   InitialConditions class                                                                     #
#                                                                                               #
#   InitialConditions is an object definition of various experiment presets theat are not a     #
#   logical part of the data acquisition definition or the waveform definition. The marshall()  #
#   method packages the object into a byte array according to the file formats documentation.   #
# --------------------------------------------------------------------------------------------- #
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
# --------------------------------------------------------------------------------------------- #

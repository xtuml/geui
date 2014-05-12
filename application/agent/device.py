# --------------------------------------------------------------------------------------------- #
#   device.py                                                                                   #
#                                                                                               #
#   Classes defined in this file:                                                               #
#       * Device                                                                                #
# --------------------------------------------------------------------------------------------- #


# --------------------------------------------------------------------------------------------- #
#   Device class                                                                                #
#                                                                                               #
#   The Device class maintains information about the physical hardware of the specific device.  #
# --------------------------------------------------------------------------------------------- #
class Device:
    
    min_tick = 0            # fastest tick rate in Hz
    min_step = 0            # smallest step in uV

    def __init__(self, min_tick=0, min_step=0):
        self.min_tick = min_tick
        self.min_step = min_step
# --------------------------------------------------------------------------------------------- #

from device_commands import *

class Agent:

    commands = {
        0x01: VER(),
    }

    device = None
    encoder = None
    parser = None

    def __init__(self):
        self.device = Device()
        self.encoder = Encoder(self)
        self.parser = Parser(self)

    def execute(self, command_key, data):
        self.encoder.write_command(self.commands[command_key], data)

class Encoder:

    agent = None
    
    def __init__(self, agent):
        self.agent = agent

    def write_command(self, command, data):
        byte_data = command.encode(data)
        byte_data.insert(0, command.code)
        byte_data.insert(1, command.length[0])
        byte_data.insert(1, command.length[1])
        self.agent.device.write(byte_data)
        if command.response == True:
            self.agent.parser.read_response()

class Parser:

    agent = None
    
    def __init__(self, agent):
        self.agent = agent

    def read_response(self):
        data = self.agent.device.read()
        command = self.agent.commands[data[0]]
        length = int(data[1])*256 + int(data[2])
        new_data = data[3:length+3]
        print command.parse(new_data)

        

class Device:

    VENDOR_ID  = 0x0483             # ST's Vendor ID
    PRODUCT_ID = 0x9999             # pulled out of thin air
    EP_IN = None                    # Endpoint to read
    EP_OUT = None                   # Endpoint to write
    dev = None                      # Device instance

    def __init__(self):
        import sys
        import usb.core
        import usb.util

        #find our device
        self.dev = usb.core.find(idVendor=self.VENDOR_ID, idProduct=self.PRODUCT_ID)

        if self.dev is None:
            sys.exit("Could not find our device.\n")

        # If the built-in kernel module has already loaded the HID driver, we
        # need to detach it so we can use it.
        if self.dev.is_kernel_driver_active(0):
            try:
                self.dev.detach_kernel_driver(0)
            except usb.core.USBError as e:
                sys.exit("Could not detatch kernel driver: %s" % str(e))

        # set_configuration() will use the first configuration which is fine
        # because we only have one.  The reset() initializes everything.
        try:
            self.dev.set_configuration()
            self.dev.reset()
        except usb.core.USBError as e:
            sys.exit("Could not set configuration: %s" % str(e))

        # Set up some shorthand for accessing the endpoints then print some
        # info to the terminal for debugging.
        self.EP_IN  = self.dev[0][(0,0)][0]
        self.EP_OUT = self.dev[0][(0,0)][1]

    def write(self, data):
        self.EP_OUT.write(data)

    def read(self):
        return self.dev.read(self.EP_IN.bEndpointAddress, self.EP_IN.wMaxPacketSize)

#test that gets the version
test_agent = Agent()
test_agent.execute(0x01, [])

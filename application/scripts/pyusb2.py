#=====================================================================
# pyusb code
#
# Lots of credit to this site for making some sense out of PyUSB...
# http://www.micahcarrick.com/credit-card-reader-pyusb.html
#
# usage (from Linux command line):
#   sudo python pyusb2.py
#
# Note:  Since PyUSB allows direct access to hardware certain calls
#        require root permissions.  See an explanation here:
# http://stackoverflow.com/questions/3738173/why-does-pyusb-libusb-require-root-sudo-permissions-on-linux?rq=1
#=====================================================================
import sys
import usb.core
import usb.util

VENDOR_ID  = 0x0483             # ST's Vendor ID
PRODUCT_ID = 0x9999             # pulled out of thin air

#=====================================================================
# find our device
#=====================================================================
dev = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)

if dev is None:
    sys.exit("Could not find our device.\n")

#=====================================================================
# If the built-in kernel module has already loaded the HID driver, we
# need to detach it so we can use it.
#=====================================================================
if dev.is_kernel_driver_active(0):
    try:
        dev.detach_kernel_driver(0)
    except usb.core.USBError as e:
        sys.exit("Could not detatch kernel driver: %s" % str(e))

#=====================================================================
# set_configuration() will use the first configuration which is fine
# because we only have one.  The reset() initializes everything.
#=====================================================================
try:
    dev.set_configuration()
    dev.reset()
except usb.core.USBError as e:
    sys.exit("Could not set configuration: %s" % str(e))

#=====================================================================
# Set up some shorthand for accessing the endpoints then print some
# info to the terminal for debugging.
#=====================================================================
EP_IN  = dev[0][(0,0)][0]
EP_OUT = dev[0][(0,0)][1]

print "EP_IN  addr, max packet size:  0x%02x, %d " % (EP_IN.bEndpointAddress, EP_IN.wMaxPacketSize)
print "EP_OUT addr, max packet size:  0x%02x, %d " % (EP_OUT.bEndpointAddress, EP_OUT.wMaxPacketSize)

#=====================================================================
# Do a simple write and read test.
#=====================================================================
send_data = [1, 3, 5, 7, 0] 
print "writing..."
print send_data
EP_OUT.write( send_data )

print "reading..."
data = dev.read(EP_IN.bEndpointAddress, EP_IN.wMaxPacketSize)
print data

# If you write a string list this:
#    EP_OUT.write('testing 1 2 3')
# This script's output will be the ascii values of each character:
#    array('B', [116, 101, 115, 116, 105, 110, 103, 32, 49, 32, 50, 32, 51, 0, 0,  ...

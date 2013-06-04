import usb.core
import usb.util



#pyusb code
# find our device
dev = usb.core.find(idVendor=0x0483, idProduct=0x9999)

# was it found?
if dev is None:
    raise ValueError('Device not found')

interface_number = dev[0][(0,0)].bInterfaceNumber
print interface_number

dev.write(1, 'test', 0)




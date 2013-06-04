import usb.core
import usb.util

#use for testing without the client

#pyusb code
# find our device
dev = usb.core.find(idVendor=0x0483, idProduct=0x9999)

# was it found?
if dev is None:
    raise ValueError('Device not found')

dev.detach_kernel_driver(0)

dev.write(1, 'test', 0)

#attempt to read from device
reply = dev.read(1, 4, 0, 5000)
print reply



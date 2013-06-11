import web
import usb.core
import usb.util

class PyUSB:

    def POST(self):
        data = web.data()

	#pyusb code
	# find our device
	dev = usb.core.find(idVendor=0x0483, idProduct=0x9999)

	# was it found?
	if dev is None:
	    raise ValueError('Device not found')

	dev.detach_kernel_driver(0)

	dev.write(1, data, 0)

        #reverses the input string

        return 'Downloaded test string'

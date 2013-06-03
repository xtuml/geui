import web

class PyUSB:

    def POST(self):
        data = web.data()

        #pyusb code

        #reverses the input string
        reply = data[::-1]

        return reply

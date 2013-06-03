import web
import handler
import replies
import csv

handler = handler.GraphHandler()
replier = replies.ReplyCalculator()

class PyUSB:

    def POST(self):
        data = web.data()

        #pyusb code
        reply = data[::-1]

        return reply #just makes a loop

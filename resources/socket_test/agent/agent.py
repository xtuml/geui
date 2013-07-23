import threading
import Queue
from util import call
import eicomm.eibus

class Agent(threading.Thread):

    #threading attributes
    q = None
    running = None

    def __init__(self, thread_name):
        threading.Thread.__init__(self, name=thread_name)
        self.q = Queue.Queue()
        self.running = False

    def kill_thread(self):
        self.running = False

    def get_version(self):
        for t in threading.enumerate():
            if t.name == 'eicomm':
                t.q.put([eicomm.eibus.get_version])
                break

    def wave(self):
        import wave
        import eicomm.signals

        wave1 = wave.Wave(1, 100, 1, 3)

        pattern1 = wave.Pattern(1, 1)#, [wave.Segment(1, 5, [1, 2, 3, 4, 5])])
        seg1 = wave.Segment(1, 5, [1, 2, 3, 4, 5])
        pattern1.add_segment(seg1)

        pattern2 = wave.Pattern(50, 2)#, [wave.Segment(1, 5, [2, 2, 2, 2, 2]), wave.Segment(1, 5, [0, 0, 0, 0, 0])])
        seg2 = wave.Segment(1, 5, [2, 2, 2, 2, 2])
        seg3 = wave.Segment(1, 5, [0, 0, 0, 0, 0])
        pattern2.add_segment(seg2)
        pattern2.add_segment(seg3)

        pattern3 = wave.Pattern(1, 1)#, [wave.Segment(1, 5, [5, 4, 3, 2, 1])])
        seg4 = wave.Segment(1, 5, [5, 4, 3, 2, 1])
        pattern3.add_segment(seg4)

        wave1.add_pattern(pattern1)
        wave1.add_pattern(pattern2)
        wave1.add_pattern(pattern3)

        x = wave1.pack()
        #print x

        signal = eicomm.signals.wave(args=x)

        for t in threading.enumerate():
            if t.name == 'eicomm':
                t.signals.put(signal)
                t.q.put([t.handle_signal])

    def version(self, version):
        print 'Version: ' + version

    def run(self):
        self.running = True
        while self.running:

            #wait for command
            cmd = self.q.get()

            #run command
            call(cmd)

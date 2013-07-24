import threading
from util import call
import time

class TestBench(threading.Thread):
    
    wait = None
    test = None

    def __init__(self, thread_name, wait=0):
        threading.Thread.__init__(self, name=thread_name)
        self.wait = wait
        self.test = None

    def send_wave(self):
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

    def run(self):
        if self.test != None:
            time.sleep(self.wait)
            print 'Running test...'
            call([self.test]) 
            print 'Exited Test Bench at ' + time.ctime()

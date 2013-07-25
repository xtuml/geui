#mathematical representation of waveform


class Wave:

    waveID = None       #key generated by security functions
    E_final = None      #voltage at end of experiment
    N = None            #number of times to repeat this wave
    n = None            #number of patterns in this wave

    patterns = []       #container for wave patterns

    def __init__(self, waveID=None, E_final=None, N=None, n=None):
        self.waveID = waveID
        self.E_final = E_final
        self.N = N
        self.n = n
        self.patterns = []

    def add_pattern(self, pattern):
        self.patterns.append(pattern)

    def pack(self):     #pack up wave into an array of values
        values = []

        #pack up header
        values.append(self.waveID)
        values.append(self.E_final)
        values.append(self.N)
        values.append(self.n)

        #pack up patterns
        for pattern in self.patterns:
            values.append(pattern.N)
            values.append(pattern.n)

            #pack up segments
            for segment in pattern.segments:
                values.append(segment.tick_rate)
                values.append(segment.n)

                #pack up points
                for point in segment.points:
                    values.append(point)

        return values


class Pattern:
    
    N = None            #number of times to repeat this pattern
    n = None            #number of segments in this pattern

    segments = []       #container for segments

    def __init__(self, N=None, n=None):
        self.N = N
        self.n = n
        self.segments = []

    def add_segment(self, segment):
        self.segments.append(segment)

class Segment:

    tick_rate = None    #frequency of points in milliseconds
    n = None            #number of points in this segment

    points = []         #container for voltage values

    def __init__(self, tick_rate=None, n=None, points=[]):
        self.tick_rate = tick_rate
        self.n = n
        self.points = points

    def add_point(self, point):
        self.points.append(point)
import threading
import experiment
import data_acquisition
import conditions
import wave

# data model for Cyclic Voltammetry
class CV(experiment.Experiment):

    def __init__(self, name=""):
        experiment.Experiment.__init__(self, name)
        self.graph = Graph()
        self.graph.experiment = self
        self.graph.add_pattern([0.0, 0.0, 0.0, 10.0, 1])
        self.save()
        t = threading.currentThread()
        t.experiment_list.add_experiment(name)

    # replies to the client points to delete, add, and update
    def calculate_reply(self, old_vertices, new_vertices):

        points = []

        for vertex in new_vertices:
            points.append([vertex.x, vertex.y])

        # return reply
        if self.agent is not None and self.agent.httpcomm is not None:
            self.agent.httpcomm.q.put([self.agent.httpcomm.update_graph, points])


# Graph as a whole as defined by the user
class Graph:
    
    experiment = None

    contents = []

    def __init__(self):
        self.contents = []

    def translate(self, wave_type=0):                                   # defaults to linear segment model

        # determine tick
        wave_rate = self.contents[0].contents[0].rate                   # scan rate of the experiment in mV/s
        data_rate = self.contents[0].contents[0].data_rate              # data rate of the experiment in samples/s
        wave_tick = self.experiment.device.min_tick / (wave_rate * 1000 / self.experiment.device.min_step)
        data_tick = self.experiment.device.min_tick / data_rate
        from fractions import gcd
        self.experiment.tick = gcd(wave_tick, data_tick)                # defined in counts of base system tick

        # create parameter objects
        waveform = wave.Wave(1, 0, wave_type, 1, len(self.contents))    # wave object
        dacq = data_acquisition.DataAcquisition(1, 1, len(self.contents))   # data acquisition object
        con = conditions.InitialConditions(self.experiment.tick, 0, 0, 0)   # initial conditions object

        for pattern in self.contents:
            wave_pattern = wave.Pattern(pattern.repeat_value, len(pattern.contents))
            dacq_pattern = data_acquisition.Pattern(pattern.repeat_value, len(pattern.contents))
            for segment in pattern.contents:
                if (wave_type == 0):
                    # create wave segment
                    ticks = 1                                       # assuming the scan rate divides into data rate and is universal
                    s = int(segment.start_value * 10)
                    e = int(segment.end_value * 10)
                    wave_segment = wave.LinearSegment(ticks, s, e)

                    # add segment to pattern
                    wave_pattern.add_segment(wave_segment)


                else:
                    p = abs(segment.start_value - segment.end_value) * 1000 / self.experiment.device.min_step      # number of points per segment 
                                                                                                                        # based on step size voltage range
                    wave_segment = wave.Segment(1, p, [])

                    # calculate points (based on linear model)
                    start_value = float(segment.start_value)
                    end_value = float(segment.end_value)
                    rate = float(segment.rate)
                    interval = float(segment.duration) / p      # time interval (seconds) between points
                    point_num = 0                               # point counter

                    points = []                                 # container for voltage points

                    while point_num < p: 
                        new_point = start_value + rate * interval * point_num * 10      # measured in multiples of 100uV
                        points.append(new_point)
                        waveform.points.append(new_point)
                        point_num += 1

                    # add points to segment
                    wave_segment.add_points(points)

                    # add segment to pattern
                    wave_pattern.add_segment(wave_segment)

                # create dacq segment
                n = int(segment.duration * segment.data_rate)
                t = int(segment.duration * self.experiment.device.min_tick / self.experiment.tick)
                sample = data_acquisition.Sample(t, 0)
                dacq_segment = data_acquisition.Segment(n)
                dacq_segment.sample = sample

                # add to pattern
                dacq_pattern.add_segment(dacq_segment)

            # add pattern to waveform
            waveform.add_pattern(wave_pattern)
            # add dacq pattern
            dacq.add_pattern(dacq_pattern)

        self.experiment.wave = waveform             # assign waveform object
        self.experiment.wave.experiment = self.experiment
        self.experiment.dataAcquisition = dacq      # assign data acquisition object
        self.experiment.conditions = con            # assign initital conditions object

    # appends a pattern to the graph's contents
    def add_pattern(self, values):
        new_pattern = Pattern(values[4], self)
        self.contents.append(new_pattern)
        new_pattern.add_segment(values)
        
    # deletes pattern from the graph's contents at the specified position
    def delete_pattern(self, position):
        self.contents.pop(position)    
        if position < len(self.contents):
            self.update_points(position)

    # moves a pattern from the given position to the given destination
    def move_pattern(self, position, destination):
        temp_pattern = self.contents.pop(position)
        self.contents.insert(destination, temp_pattern)
        if position < destination:
            self.update_points(position)
        else:
            self.update_points(destination)

    # updates a pattern's repeat_value
    def update_pattern(self, repeat_value, position):
        self.contents[position].repeat_value = repeat_value 
        self.update_points(position)

    # returns array of vertices from the graph (some duplicates because each segment has exactly 2 endpoints)
    def get_vertices(self):
        vertices = []
        for pattern in self.contents:
            vertices += pattern.get_vertices()
        return vertices

    # updates the points that got moved below given position
    def update_points(self, position):
        # update this pattern
        for segment in self.contents[position].contents:
            for vertex in segment.vertices:
                vertex.update()
        # recursively update next pattern
        if position < len(self.contents) - 1:
            self.update_points(position + 1)

    # returns values to populate the clients table
    def calculate_pattern_params(self):
        if (len(self.contents) != 0):
            param_list = []
            for pattern in self.contents:
                if self.contents.index(pattern) > 0:
                    start_time = self.contents[self.contents.index(pattern) - 1].calculate_end_time()
                else:
                    start_time = 0
                # return repeat_value, start_time, and duration
                param_list.append([pattern.repeat_value, start_time, pattern.calculate_duration()])

        if self.experiment is not None and self.experiment.agent is not None and self.experiment.agent.httpcomm is not None:
            self.experiment.agent.httpcomm.q.put([self.experiment.agent.httpcomm.load_table, param_list, "pattern"])

# Patterns that make up the graph
class Pattern:
    
    parent = None
    contents = []

    repeat_value = 0

    def __init__(self, repeat_value, parent):
        self.contents = [] 
        self.parent = parent
        self.repeat_value = repeat_value
        
    # appends a segment to the patterns's contents
    def add_segment(self, values):
        new_segment = Segment(values, self)
        self.contents.append(new_segment)
        for vertex in new_segment.vertices:
            vertex.update()
        # update following patterns
        if self.parent.contents.index(self) + 1 < len(self.parent.contents):
            self.parent.update_points(self.parent.contents.index(self) + 1)
        
    # deletes segment from the patterns's contents at the specified position
    def delete_segment(self, position):
        self.contents.pop(position)    
        if position < len(self.contents):
            self.update_points(position)
        # update following patterns
        if self.parent.contents.index(self) + 1 < len(self.parent.contents):
            self.parent.update_points(self.parent.contents.index(self) + 1)

    # moves a segment from the given position to the given destination
    def move_segment(self, position, destination):
        temp_segment = self.contents.pop(position)
        self.contents.insert(destination, temp_segment)
        if position < destination:
            self.update_points(position)
        else:
            self.update_points(destination)

    # updates the points that got moved below given position
    def update_points(self, position):
        # update this pattern
        for vertex in self.contents[position].vertices:
            vertex.update()
        # recursively update next segment 
        if position < len(self.contents) - 1:
            self.update_points(position + 1)

    # returns array of vertices from the pattern (some duplicates because each segment has exactly 2 endpoints)
    def get_vertices(self):
        vertices = []
        iteration = 0       # keeps track of what repeat it's on
        one_repeat = self.calculate_duration() / self.repeat_value  # duration of one iteration of the pattern
        while iteration < self.repeat_value:
            for segment in self.contents:
                for vertex in segment.vertices:
                    vertices.append(Vertex(None, 0, vertex.x + one_repeat * iteration,vertex.y))
            iteration += 1
        return vertices

    # calculates pattern end time
    def calculate_end_time(self):
        position = self.parent.contents.index(self)
        duration = self.calculate_duration()
        if position > 0:
            return self.parent.contents[position - 1].calculate_end_time() + duration
        else:
            return duration

    # calculate duration of pattern
    def calculate_duration(self):
        duration = 0
        for segment in self.contents:
            duration += segment.duration
        # account for repeats
        duration *= self.repeat_value
        return duration

    # returns values to populate the clients table
    def calculate_segment_params(self):
        if (len(self.contents) != 0):
            param_list = []
            for segment in self.contents:
                param_list.append([segment.start_value, segment.end_value, segment.rate, segment.duration])

        if self.parent is not None and self.parent.experiment is not None and self.parent.experiment.agent is not None and self.parent.experiment.agent.httpcomm is not None:
            self.parent.experiment.agent.httpcomm.q.put([self.parent.experiment.agent.httpcomm.load_table, param_list, "segment"])

# segments that make up patterns
class Segment:

    parent = None

    vertices = []

    start_value = 0             # start voltage value in mV
    end_value = 0               # end voltage value in mV
    rate = 0                    # scan rate in mV/s
    duration = 0                # duration of segment in seconds

    data_rate = 0               # data sampling rate in points per second

    def __init__(self, values, parent):
        self.parent = parent
        self.start_value = values[0]
        self.end_value = values[1]
        self.rate = values[2]
        self.duration = values[3]
        self.vertices = [Vertex(self, 1), Vertex(self, 2)]

        self.data_rate = 1      # 1 sample per second (for testing)

    # updates a segment's values
    def update(self, values):
        self.start_value = values[0]
        self.end_value = values[1]
        self.rate = values[2]
        if self.duration != values[3]:
            self.duration = values[3]
            self.parent.parent.update_points(self.parent.parent.contents.index(self.parent))
        for vertex in self.vertices:
            vertex.update()

    # calculate start time
    def calculate_start_time(self):
        pat_position = self.parent.parent.contents.index(self.parent)   # position of the containing pattern
        # calculate baseline time to start
        if pat_position > 0:
            base = self.parent.parent.contents[pat_position - 1].calculate_end_time()
        else:
            base = 0
        seg_position = self.parent.contents.index(self)                 # position of the segment
        if seg_position > 0:
            return self.parent.contents[seg_position - 1].calculate_start_time() + self.parent.contents[seg_position - 1].duration
        else:
            return base

class Vertex:

    x = 0
    y = 0

    segment = None
    v_num = 0       # 1 or 2. 1 for first vertex, 2 for second vertex in a segment

    def __init__(self, segment, v_num, x=0, y=0):
        self.segment = segment
        self.v_num = v_num
        self.x = x
        self.y = y

    def update(self):
        if self.v_num == 1:
            self.x = self.segment.calculate_start_time()
            self.y = self.segment.start_value
        else:
            self.x = self.segment.calculate_start_time() + self.segment.duration
            self.y = self.segment.end_value

import threading
import httpcomm.eihttp
import wave
import gnosis.xml.pickle
from gnosis.xml.pickle.util import setParanoia
setParanoia(0)

#data model for an experiment
class Experiment:

    name = ''
    graph = None
    wave = None
    data_file = None

    def __init__(self, graph=None, name=''):
        self.graph = graph
        self.name = name

    #public static method to create an experiment
    @staticmethod
    def create(name):
        new_graph = Graph()
        t = threading.currentThread()
        t.experiment_list.add_experiment(name)
        new_experiment = Experiment(new_graph, name)
        new_experiment.graph.add_pattern([0.0, 0.0, 0.0, 10.0, 1])
        new_experiment.save()
        return new_experiment

    #public static method to open an experiment with an experiment name
    @staticmethod
    def open(name):
        #open experiment
        #open a saved file
        try:
            saved_file = open('data/'+name+'.xml','r')
            xml_string = saved_file.read()
            saved_file.close()
            return gnosis.xml.pickle.loads(xml_string)

        except IOError:
            return None

    #dump to xml file
    def save(self):
        #save the file 
        save_file = open('data/'+self.name+'.xml','w')
        save_file.write(gnosis.xml.pickle.dumps(self))
        save_file.close()

    #replies to the client points to delete, add, and update
    def calculate_reply(self, old_vertices, new_vertices):

        points = []

        for vertex in new_vertices:
            points.append([vertex.x, vertex.y])

        #return reply
        for t in threading.enumerate():
            if t.name == 'httpcomm':
                t.q.put([httpcomm.eihttp.update_graph, points])

#Graph as a whole as defined by the user
class Graph:
    
    contents = []

    def __init__(self):
        self.contents = []

    def translate(self):
        waveform = wave.Wave(1, 0, 1, len(self.contents))
        for pattern in self.contents:
            wave_pattern = wave.Pattern(pattern.repeat_value, len(pattern.contents))
            for segment in pattern.contents:
                p = 5                                        #number of points per segment based on system tick, step size, and duration
                wave_segment = wave.Segment(1, p, [])

                #calculate points (based on linear model)
                start_value = float(segment.start_value)
                end_value = float(segment.end_value)
                rate = float(segment.rate)
                interval = float(segment.duration) / p      # time interval (seconds) between points
                point_num = 0                               # point counter

                points = []                                 # container for voltage points

                while point_num < p: 
                    new_point = start_value + rate * interval * point_num
                    points.append(new_point)
                    waveform.points.append(new_point)
                    point_num += 1

                #add points to segment
                wave_segment.add_points(points)

                #add segment to pattern
                wave_pattern.add_segment(wave_segment)

            #add pattern to waveform
            waveform.add_pattern(wave_pattern)

        return waveform

    #appends a pattern to the graph's contents
    def add_pattern(self, values):
        new_pattern = Pattern(values[4], self)
        self.contents.append(new_pattern)
        new_pattern.add_segment(values)
        
    #deletes pattern from the graph's contents at the specified position
    def delete_pattern(self, position):
        self.contents.pop(position)    
        if position < len(self.contents):
            self.update_points(position)

    #moves a pattern from the given position to the given destination
    def move_pattern(self, position, destination):
        temp_pattern = self.contents.pop(position)
        self.contents.insert(destination, temp_pattern)
        if position < destination:
            self.update_points(position)
        else:
            self.update_points(destination)

    #updates a pattern's repeat_value
    def update_pattern(self, repeat_value, position):
        self.contents[position].repeat_value = repeat_value 
        self.update_points(position)

    #returns array of vertices from the graph (some duplicates because each segment has exactly 2 endpoints)
    def get_vertices(self):
        vertices = []
        for pattern in self.contents:
            vertices += pattern.get_vertices()
        return vertices

    #updates the points that got moved below given position
    def update_points(self, position):
        #update this pattern
        for segment in self.contents[position].contents:
            for vertex in segment.vertices:
                vertex.update()
        #recursively update next pattern
        if position < len(self.contents) - 1:
            self.update_points(position + 1)

    #returns values to populate the clients table
    def calculate_pattern_params(self):
        if (len(self.contents) != 0):
            param_list = []
            for pattern in self.contents:
                if self.contents.index(pattern) > 0:
                    start_time = self.contents[self.contents.index(pattern) - 1].calculate_end_time()
                else:
                    start_time = 0
                #return repeat_value, start_time, and duration
                param_list.append([pattern.repeat_value, start_time, pattern.calculate_duration()])

        for t in threading.enumerate():
            if t.name == 'httpcomm':
                t.q.put([httpcomm.eihttp.load_table, param_list, 'pattern'])

#Patterns that make up the graph
class Pattern:
    
    parent = None
    contents = []

    repeat_value = 0

    def __init__(self, repeat_value, parent):
        self.contents = [] 
        self.parent = parent
        self.repeat_value = repeat_value
        
    #appends a segment to the patterns's contents
    def add_segment(self, values):
        new_segment = Segment(values, self)
        self.contents.append(new_segment)
        for vertex in new_segment.vertices:
            vertex.update()
        #update following patterns
        if self.parent.contents.index(self) + 1 < len(self.parent.contents):
            self.parent.update_points(self.parent.contents.index(self) + 1)
        
    #deletes segment from the patterns's contents at the specified position
    def delete_segment(self, position):
        self.contents.pop(position)    
        if position < len(self.contents):
            self.update_points(position)
        #update following patterns
        if self.parent.contents.index(self) + 1 < len(self.parent.contents):
            self.parent.update_points(self.parent.contents.index(self) + 1)

    #moves a segment from the given position to the given destination
    def move_segment(self, position, destination):
        temp_segment = self.contents.pop(position)
        self.contents.insert(destination, temp_segment)
        if position < destination:
            self.update_points(position)
        else:
            self.update_points(destination)

    #updates the points that got moved below given position
    def update_points(self, position):
        #update this pattern
        for vertex in self.contents[position].vertices:
            vertex.update()
        #recursively update next segment 
        if position < len(self.contents) - 1:
            self.update_points(position + 1)

    #returns array of vertices from the pattern (some duplicates because each segment has exactly 2 endpoints)
    def get_vertices(self):
        vertices = []
        iteration = 0       #keeps track of what repeat it's on
        one_repeat = self.calculate_duration() / self.repeat_value  #duration of one iteration of the pattern
        while iteration < self.repeat_value:
            for segment in self.contents:
                for vertex in segment.vertices:
                    vertices.append(Vertex(None, 0, vertex.x + one_repeat * iteration,vertex.y))
            iteration += 1
        return vertices

    #calculates pattern end time
    def calculate_end_time(self):
        position = self.parent.contents.index(self)
        duration = self.calculate_duration()
        if position > 0:
            return self.parent.contents[position - 1].calculate_end_time() + duration
        else:
            return duration

    #calculate duration of pattern
    def calculate_duration(self):
        duration = 0
        for segment in self.contents:
            duration += segment.duration
        #account for repeats
        duration *= self.repeat_value
        return duration

    #returns values to populate the clients table
    def calculate_segment_params(self):
        if (len(self.contents) != 0):
            param_list = []
            for segment in self.contents:
                param_list.append([segment.start_value, segment.end_value, segment.rate, segment.duration])

        for t in threading.enumerate():
            if t.name == 'httpcomm':
                t.q.put([httpcomm.eihttp.load_table, param_list, 'segment'])

#segments that make up patterns
class Segment:

    parent = None

    vertices = []

    start_value = 0
    end_value = 0
    rate = 0
    duration = 0

    def __init__(self, values, parent):
        self.parent = parent
        self.start_value = values[0]
        self.end_value = values[1]
        self.rate = values[2]
        self.duration = values[3]
        self.vertices = [Vertex(self, 1), Vertex(self, 2)]

    #updates a segment's values
    def update(self, values):
        self.start_value = values[0]
        self.end_value = values[1]
        self.rate = values[2]
        if self.duration != values[3]:
            self.duration = values[3]
            self.parent.parent.update_points(self.parent.parent.contents.index(self.parent))
        for vertex in self.vertices:
            vertex.update()

    #calculate start time
    def calculate_start_time(self):
        pat_position = self.parent.parent.contents.index(self.parent)   #position of the containing pattern
        #calculate baseline time to start
        if pat_position > 0:
            base = self.parent.parent.contents[pat_position - 1].calculate_end_time()
        else:
            base = 0
        seg_position = self.parent.contents.index(self)                 #position of the segment
        if seg_position > 0:
            return self.parent.contents[seg_position - 1].calculate_start_time() + self.parent.contents[seg_position - 1].duration
        else:
            return base

class Vertex:

    x = 0
    y = 0

    segment = None
    v_num = 0       #1 or 2. 1 for first vertex, 2 for second vertex in a segment

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

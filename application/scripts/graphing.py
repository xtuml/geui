#data model for the graph

class graph:
    
    name = ''
    contents = []
    vertices = []

    def __init__(self):
        self.contents = []
        self.vertices = []

class segment:

    graph = None

    start_value = 0
    end_value = 0
    rate = 0
    time = 0

    def __init__(self, start_value, end_value, rate, duration):
        self.start_value = start_value
        self.end_value = end_value
        self.rate = rate
        self.duration = duration
        self.graph = None

class pattern:
    
    graph = None
    contents = []

    def __init__(self):
        self.contents = [] 

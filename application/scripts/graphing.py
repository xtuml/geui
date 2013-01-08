class graph:
    
    name = ''
    number_segments = 0
    starts_with = None
    ends_with = None

    def __init__(self):
        pass

class segment:

    position = 0
    is_before = None
    is_after = None
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
        self.position = 0
        self.is_before = None
        self.is_after = None
        self.graph = None

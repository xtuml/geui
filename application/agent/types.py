class Table:
    rows = None

    def __init__(self, rows):
        self.rows = rows

class Row:
    start_value = None
    end_value = None
    rate = None
    duration = None
    repeat_value = None

    def __init__(self, start_value, end_value, rate, duration, repeat_value):
        self.start_value = start_value
        self.end_value = end_value
        self.rate = rate
        self.duration = duration
        self.repeat_value = repeat_value

class GraphDiff:
    delete = None
    add = None
    update = None

    def __init__(self, delete, add, update):
        self.delete = delete
        self.add = add
        self.update = update

class UPoint:
    position = None
    point = None

    def __init__(self, position, point):
        self.position = position
        self.point = point

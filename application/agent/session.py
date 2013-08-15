import time

class Session:

    name = None             #name of the user holding the session
    increment = None        #increment multiplier of the session
    start_time = None       #system time when the session was initiated in seconds
    
    def __init__(self, name): 
        self.name = name
        self.start_time = time.time()

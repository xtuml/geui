# eihttp interface for communicating with the GUI

class EIhttp:

    #----- SIGNALS TO GUI -----#

    # version response from agent
    def version(self, version):
        raise NotImplementedError

    # data packet from agent
    def data(self, points, action):
        raise NotImplementedError

    # chart data response from agent
    def update_graph(self, points):
        raise NotImplementedError

    # table data response from agent
    def load_table(self, rows, table_id):
        raise NotImplementedError

    # send GUI list of saved experiment
    def load_experiments(self, experiments):
        raise NotImplementedError

    # send GUI indication that the upload was a success
    def upload_success(self, name):
        raise NotImplementedError

    #----- SIGNALS TO AGENT -----#

    # exit
    def exit(self):
        raise NotImplementedError

    # download waveform to device
    def download(self):
        raise NotImplementedError

    # get version command sent from GUI 
    def get_version(self):
        raise NotImplementedError

    # save experiment command sent from GUI 
    def save_experiment(self):
        raise NotImplementedError

    # get experiments command sent from GUI 
    def get_experiments(self):
        raise NotImplementedError

    # request table command sent from GUI 
    def request_table(self, table_id, position):
        raise NotImplementedError

    # open experiment command sent from GUI 
    def open_experiment(self, name):
        raise NotImplementedError

    # create experiment command sent from GUI 
    def create_experiment(self, name):
        raise NotImplementedError

    # delete experiment command sent from GUI 
    def delete_experiment(self, name):
        raise NotImplementedError

    # allows user to upload their own experiment files
    def upload_file(self, name, contents):
        raise NotImplementedError

    # add pattern command sent from GUI 
    def add_pattern(self, start_value, end_value, rate, duration, repeat_value):
        raise NotImplementedError

    # delete pattern command sent from GUI 
    def delete_pattern(self, positions):
        raise NotImplementedError

    # move pattern command sent from GUI 
    def move_pattern(self, position, destination):
        raise NotImplementedError

    # update pattern command sent from GUI 
    def update_pattern(self, repeat_value, position):
        raise NotImplementedError

    # add segment command sent from GUI 
    def add_segment(self, start_value, end_value, rate, duration, repeat_value, position):
        raise NotImplementedError

    # delete segment command sent from GUI 
    def delete_segment(self, positions):
        raise NotImplementedError

    # move segment command sent from GUI 
    def move_segment(self, position, destination):
        raise NotImplementedError

    # update segment command sent from GUI 
    def update_segment(self, start_value, end_value, rate, duration, repeat_value, position):
        raise NotImplementedError

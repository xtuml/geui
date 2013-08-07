#eihttp interface for communicating with the GUI

import threading
import eicomm.eibus

#----- SIGNALS TO AGENT -----#

#exit
def exit():
    t = threading.currentThread()
    t.exit()

#download waveform to device
def download():
    t = threading.currentThread()
    t.download()

#get version command sent from GUI 
def get_version():
    t = threading.currentThread()
    t.get_version()

#save experiment command sent from GUI 
def save_experiment():
    t = threading.currentThread()
    if t.current_experiment != None:
        t.current_experiment.save()

#get experiments command sent from GUI 
def get_experiments():
    t = threading.currentThread()
    t.get_experiments()

#request table command sent from GUI 
def request_table(table_id, position):
    t = threading.currentThread()
    if t.current_experiment != None:
        if table_id == 'pattern':
            t.current_experiment.graph.calculate_pattern_params()
        elif table_id == 'segment':
            t.current_experiment.graph.contents[position].calculate_segment_params()

#open experiment command sent from GUI 
def open_experiment(name):
    t = threading.currentThread()
    from experiment import Experiment
    current_experiment = Experiment.open(name)
    #return data to GUI
    if current_experiment != None:
        t.current_experiment = current_experiment
        current_experiment.calculate_reply([], current_experiment.graph.get_vertices())
        current_experiment.graph.calculate_pattern_params()

#create experiment command sent from GUI 
def create_experiment(name):
    t = threading.currentThread()
    from experiment import Experiment
    current_experiment = Experiment.create(name)
    t.current_experiment = current_experiment
    current_experiment.calculate_reply([], current_experiment.graph.get_vertices())
    current_experiment.graph.calculate_pattern_params()

#delete experiment command sent from GUI 
def delete_experiment(name):
    t = threading.currentThread()
    t.delete_experiment(name);

#allows user to upload their own experiment files
def upload_file(name, contents):
    t = threading.currentThread()
    t.check_upload(name, contents)

#add pattern command sent from GUI 
def add_pattern(start_value, end_value, rate, duration, repeat_value):
    t = threading.currentThread()
    if t.current_experiment != None:
        E = t.current_experiment 
        old_vertices = list(E.graph.get_vertices())
        E.graph.add_pattern([start_value, end_value, rate, duration, repeat_value])
        E.calculate_reply(old_vertices, E.graph.get_vertices())
        E.graph.calculate_pattern_params()

#delete pattern command sent from GUI 
def delete_pattern(positions):
    t = threading.currentThread()
    if t.current_experiment != None:
            E = t.current_experiment 
            old_vertices = list(E.graph.get_vertices())
            for position in positions:
                E.graph.delete_pattern(position)
            E.calculate_reply(old_vertices, E.graph.get_vertices())
            E.graph.calculate_pattern_params()

#move pattern command sent from GUI 
def move_pattern(position, destination):
    t = threading.currentThread()
    if t.current_experiment != None:
        E = t.current_experiment 
        old_vertices = list(E.graph.get_vertices())
        E.graph.move_pattern(position, destination)
        E.calculate_reply(old_vertices, E.graph.get_vertices())

#update pattern command sent from GUI 
def update_pattern(repeat_value, position):
    t = threading.currentThread()
    if t.current_experiment != None:
        E = t.current_experiment 
        old_vertices = list(E.graph.get_vertices())
        E.graph.update_pattern(repeat_value, position)
        E.calculate_reply(old_vertices, E.graph.get_vertices())

#add segment command sent from GUI 
def add_segment(start_value, end_value, rate, duration, pattern):
    t = threading.currentThread()
    if t.current_experiment != None:
        E = t.current_experiment 
        old_vertices = list(E.graph.get_vertices())
        E.graph.contents[pattern].add_segment([start_value, end_value, rate, duration])
        E.calculate_reply(old_vertices, E.graph.get_vertices())

#delete segment command sent from GUI 
def delete_segment(positions, pattern):
    t = threading.currentThread()
    if t.current_experiment != None:
            E = t.current_experiment 
            old_vertices = list(E.graph.get_vertices())
            for position in positions:
                E.graph.contents[pattern].delete_segment(position)
            E.calculate_reply(old_vertices, E.graph.get_vertices())

#move segment command sent from GUI 
def move_segment(position, destination, pattern):
    t = threading.currentThread()
    if t.current_experiment != None:
        E = t.current_experiment 
        old_vertices = list(E.graph.get_vertices())
        E.graph.contents[pattern].move_segment(position, destination)
        E.calculate_reply(old_vertices, E.graph.get_vertices())

#update segment command sent from GUI 
def update_segment(start_value, end_value, rate, duration, position, pattern):
    t = threading.currentThread()
    if t.current_experiment != None:
        E = t.current_experiment 
        old_vertices = list(E.graph.get_vertices())
        E.graph.contents[pattern].contents[position].update([start_value, end_value, rate, duration])
        E.calculate_reply(old_vertices, E.graph.get_vertices())

#----- SIGNALS TO GUI -----#

#version response from agent
def version(version):
    pass

#chart data response from agent
def update_graph(points):
    pass

#table data response from agent
def load_table(rows, table_id):
    pass

#send GUI list of saved experiment
def load_experiments(names):
    pass

#send GUI indication that the upload was a success
def upload_success(name):
    pass

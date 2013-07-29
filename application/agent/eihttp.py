#eihttp interface for communicating with the GUI

import threading
import eicomm.eibus

#----- SIGNALS TO AGENT -----#

#exit
def exit():
    t = threading.currentThread()
    t.q.put([t.exit])

#download waveform to device
def download():
    t = threading.currentThread()
    t.q.put([t.download])

#get version command sent from GUI 
def get_version():
    for t in threading.enumerate():
        if t.name == 'eicomm':
            t.q.put([eicomm.eibus.get_version])
            break

#save experiment command sent from GUI 
def save_experiment():
    t = threading.currentThread()
    if t.current_experiment != None:
        t.current_experiment.save()

#get experiments command sent from GUI 
def get_experiments():
    pass

#open experiment command sent from GUI 
def open_experiment(name):
    t = threading.currentThread()
    from experiment import Experiment
    current_experiment = Experiment.open(name)
    if current_experiment != None:
        t.experiments.append(current_experiment)
        t.current_experiment = current_experiment
        current_experiment.calculate_reply([], current_experiment.graph.get_vertices())
        current_experiment.calculate_table_reply()

#create experiment command sent from GUI 
def create_experiment(name):
    t = threading.currentThread()
    from experiment import Experiment
    current_experiment = Experiment.create(name)
    t.experiments.append(current_experiment)
    t.current_experiment = current_experiment
    current_experiment.calculate_reply([], current_experiment.graph.get_vertices())

#add segment command sent from GUI 
#only adds pattern
def add_segment(start_value, end_value, rate, duration, repeat_value, position):
    t = threading.currentThread()
    if t.current_experiment != None:
        E = t.current_experiment 
        old_vertices = list(E.graph.get_vertices())
        E.graph.add_pattern([start_value, end_value, rate, duration, repeat_value])
        E.calculate_reply(old_vertices, E.graph.get_vertices())

#delete segment command sent from GUI 
#only deletes pattern
def delete_segment(positions):
    t = threading.currentThread()
    if t.current_experiment != None:
            E = t.current_experiment 
            old_vertices = list(E.graph.get_vertices())
            for position in positions:
                E.graph.delete_pattern(position)
            E.calculate_reply(old_vertices, E.graph.get_vertices())

#update segment command sent from GUI 
#only updates first segment in pattern
def update_segment(start_value, end_value, rate, duration, repeat_value, position):
    t = threading.currentThread()
    if t.current_experiment != None:
        E = t.current_experiment 
        old_vertices = list(E.graph.get_vertices())
        E.graph.contents[position].contents[0].update([start_value, end_value, rate, duration])         # only updates first segment in pattern
        E.calculate_reply(old_vertices, E.graph.get_vertices())                                         # change when update gui to allow pattern editing

#move segment command sent from GUI 
#only moves pattern
def move_segment(position, destination):
    t = threading.currentThread()
    if t.current_experiment != None:
        E = t.current_experiment 
        old_vertices = list(E.graph.get_vertices())
        E.graph.move_pattern(position, destination)
        E.calculate_reply(old_vertices, E.graph.get_vertices())


#----- SIGNALS TO GUI -----#

#version response from agent
def version(version):
    pass

#chart data response from agent
def update_chart(data):
    pass

#table data response from agent
def load_table(data):
    pass

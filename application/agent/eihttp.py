#eihttp interface for communicating with the GUI

import threading
import eicomm.eibus

#----- SIGNALS TO AGENT -----#

#get version command sent from GUI 
def get_version():
    eicomm.eibus.get_version()

#save experiment command sent from GUI 
def save_experiment():
    for t in threading.enumerate():
        if t.name == 'agent':
            if len(t.experiments) > 0:
                t.experiments[0].save()

#get experiments command sent from GUI 
def get_experiments():
    pass

#open experiment command sent from GUI 
def open_experiment(name):
    for t in threading.enumerate():
        if t.name == 'agent':
            from experiment import Experiment
            current_experiment = Experiment.open(name)
            if current_experiment != None:
                t.experiments.append(current_experiment)
                current_experiment.calculate_reply([], current_experiment.graph.get_vertices())
                current_experiment.calculate_table_reply()

#create experiment command sent from GUI 
def create_experiment(name):
    for t in threading.enumerate():
        if t.name == 'agent':
            from experiment import Experiment
            current_experiment = Experiment.create(name)
            t.experiments.append(current_experiment)
            current_experiment.calculate_reply([], current_experiment.graph.get_vertices())

#add segment command sent from GUI 
def add_segment(start_value, end_value, rate, duration, repeat_value, position):
    for t in threading.enumerate():
        if t.name == 'agent':
            E = t.experiments[0] 
            old_vertices = list(E.graph.get_vertices())
            E.graph.add_segment([start_value, end_value, rate, duration], position)
            E.calculate_reply(old_vertices, E.graph.get_vertices())

#delete segment command sent from GUI 
def delete_segment(positions):
    for t in threading.enumerate():
        if t.name == 'agent':
            E = t.experiments[0]
            old_vertices = list(E.graph.get_vertices())
            for seg in positions:
                E.graph.delete_segment(seg)
            E.calculate_reply(old_vertices, E.graph.get_vertices())

#update segment command sent from GUI 
def update_segment(start_value, end_value, rate, duration, repeat_value, position):
    for t in threading.enumerate():
        if t.name == 'agent':
            E = t.experiments[0]
            old_vertices = list(E.graph.get_vertices())
            E.graph.contents[position].update([start_value, end_value, rate, duration])
            E.calculate_reply(old_vertices, E.graph.get_vertices())

#move segment command sent from GUI 
def move_segment(position, destination):
    for t in threading.enumerate():
        if t.name == 'agent':
            E = t.experiments[0]
            old_vertices = list(E.graph.get_vertices())
            E.graph.move_segment(position, destination)
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

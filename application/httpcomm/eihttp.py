#eihttp interface for communicating with the GUI

import threading
import eicomm.eibus
import json

#----- SIGNALS TO GUI -----#

#version response from agent
def version(version):
    data = {'signal': 'version', 'version': version}
    t = threading.currentThread()
    t.commands.put(['version', json.dumps(data)])

#chart data response from agent
def update_graph(delete, add, update):
    data = {
        'signal': 'update_graph',
        'delete': delete,
        'add': add,
        'update': []
    }
    if update != None:
        for point in update:
            data['update'].append({'position': point[0], 'point': [point[1], point[2]]})
    else:
        data['update'] = None
    t = threading.currentThread()
    t.commands.put(['update_graph', json.dumps(data)])

#table data response from agent
def load_table(rows):
    data = {
        'signal': 'load_table',
        'rows': rows
    }
    t = threading.currentThread()
    t.commands.put(['load_table', json.dumps(data)])


#----- SIGNALS TO AGENT -----#

#exit
def exit():
    pass

#download waveform to device
def download():
    pass

#get version command sent from GUI 
def get_version():
    pass

#save experiment command sent from GUI 
def save_experiment():
    pass

#get experiments command sent from GUI 
def get_experiments():
    pass

#open experiment command sent from GUI 
def open_experiment(name):
    pass

#create experiment command sent from GUI 
def create_experiment(name):
    pass

#add segment command sent from GUI 
def add_segment(start_value, end_value, rate, duration, repeat_value, position):
    pass

#delete segment command sent from GUI 
def delete_segment(positions):
    pass

#update segment command sent from GUI 
def update_segment(start_value, end_value, rate, duration, repeat_value, position):
    pass

#move segment command sent from GUI 
def move_segment(position, destination):
    pass

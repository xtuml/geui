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
def update_graph(points):
    data = {
        'signal': 'update_graph',
        'points': points
    }
    t = threading.currentThread()
    t.commands.put(['update_graph', json.dumps(data)])

#table data response from agent
def load_table(rows, table_id):
    data = {
        'signal': 'load_table',
        'table': table_id,
        'rows': rows
    }
    t = threading.currentThread()
    t.commands.put(['load_table', json.dumps(data)])

#send GUI list of saved experiment
def load_experiments(experiments):
    data = {
        'signal': 'load_experiments',
        'experiments': experiments
    }
    t = threading.currentThread()
    t.commands.put(['load_experiments', json.dumps(data)])

#send GUI indication that the upload was a success
def upload_success(name):
    data = {
        'signal': 'upload_success',
        'name': name
    }
    t = threading.currentThread()
    t.commands.put(['upload_success', json.dumps(data)])

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

#request table command sent from GUI 
def request_table(table_id, position):
    pass

#open experiment command sent from GUI 
def open_experiment(name):
    pass

#create experiment command sent from GUI 
def create_experiment(name):
    pass

#delete experiment command sent from GUI 
def delete_experiment(name):
    pass

#allows user to upload their own experiment files
def upload_file(name, contents):
    pass

#add pattern command sent from GUI 
def add_pattern(start_value, end_value, rate, duration, repeat_value):
    pass

#delete pattern command sent from GUI 
def delete_pattern(positions):
    pass

#move pattern command sent from GUI 
def move_pattern(position, destination):
    pass

#update pattern command sent from GUI 
def update_pattern(repeat_value, position):
    pass

#add segment command sent from GUI 
def add_segment(start_value, end_value, rate, duration, repeat_value, position):
    pass

#delete segment command sent from GUI 
def delete_segment(positions):
    pass

#move segment command sent from GUI 
def move_segment(position, destination):
    pass

#update segment command sent from GUI 
def update_segment(start_value, end_value, rate, duration, repeat_value, position):
    pass

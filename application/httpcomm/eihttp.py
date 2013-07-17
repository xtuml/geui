#eihttp interface for communicating with the GUI

import threading
import eicomm.eibus

#----- SIGNALS TO GUI -----#

#version response from agent
def version(version):
    pass

#chart data response from agent
def update_chart(data):
    t = threading.currentThread()
    t.commands.append(data)

#table data response from agent
def load_table(data):
    t = threading.currentThread()
    t.commands.append(data)


#----- SIGNALS TO AGENT -----#

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

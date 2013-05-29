import web
import graphing
import gnosis.xml.pickle

class GraphHandler:

    def open_model(self):
        name = 'mygraph' #eventually will be from user

        current_graph = graphing.graph()

        #open a saved file
        try:
            saved_file = open('data/'+name+'.xml','r')
            xml_string = saved_file.read()
            saved_file.close()
            current_graph = gnosis.xml.pickle.loads(xml_string)

        except IOError:
            pass

        return current_graph

    def update_model(self, current_graph):
        name = 'mygraph' #eventually will be from user

        #save the file 
        save_file = open('data/'+name+'.xml','w')
        save_file.write(gnosis.xml.pickle.dumps(current_graph))
        save_file.close()

    def add_segment(self, parent_graph, start_value, end_value, rate, duration, pos):
        new_segment = graphing.segment(start_value, end_value, rate, duration)
        new_segment.graph = parent_graph 
        parent_graph.contents.insert(pos, new_segment)

    def delete_segment(self, parent_graph, pos):
        parent_graph.contents.pop(pos)    

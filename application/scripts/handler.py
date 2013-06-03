import web
import graphing
import replies
import gnosis.xml.pickle

replier = replies.ReplyCalculator()

class GraphHandler:

    #opens the data model from xml and returns a graph object
    #final version will open a user specified xml file
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

    #writes the current graph to the xml file
    def update_model(self, current_graph):
        name = 'mygraph' #eventually will be from user

        #save the file 
        save_file = open('data/'+name+'.xml','w')
        save_file.write(gnosis.xml.pickle.dumps(current_graph))
        save_file.close()

    #adds a segment to the graph's contents
    def add_segment(self, parent_graph, start_value, end_value, rate, duration, pos):
        new_segment = graphing.segment(start_value, end_value, rate, duration)
        new_segment.graph = parent_graph 
        parent_graph.contents.insert(pos, new_segment)
        replier.add_points(pos, new_segment, parent_graph.vertices)

    #deletes segments from the graph's contents
    def delete_segment(self, parent_graph, pos):
        parent_graph.contents.pop(pos)    
        replier.remove_points(pos, parent_graph, parent_graph.vertices)

    #updates a segments values
    def update_segment(self, parent_graph, start_value, end_value, rate, duration, pos):
        segment = parent_graph.contents[pos]
        segment.start_value = start_value
        segment.end_value = end_value
        segment.rate = rate
        segment.duration = duration
        replier.update_point(pos, segment)

    #switches two segments
    def switch_segment(self, parent_graph, seg1, seg2):
        temp_seg = parent_graph.contents[seg1]
        parent_graph.contents[seg1] = parent_graph.contents[seg2]
        parent_graph.contents[seg2] = temp_seg
        replier.update_point(seg1, parent_graph.contents[seg1])
        

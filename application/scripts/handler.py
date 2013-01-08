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

    def update_model(self, current_graph, action, form):
        name = 'mygraph' #eventually will be from user

        if (action == 'add'):
            #add segment at end
            self.add_segment(current_graph, int(form.start_value), int(form.end_value), int(form.rate), int(form.duration))
        elif (action == 'delete'):
            #delete segment at end
            self.delete_segment(current_graph)
        else:
            pass

        #save the file 
        save_file = open('data/'+name+'.xml','w')
        save_file.write(gnosis.xml.pickle.dumps(current_graph))
        save_file.close()

    def add_segment(self, parent_graph, start_value, end_value, rate, duration):
        new_segment = graphing.segment(start_value, end_value, rate, duration)
        new_segment.graph = parent_graph 
        new_segment.position = parent_graph.number_segments
        new_segment.is_before = None

        if (parent_graph.number_segments == 0):
            parent_graph.starts_with = new_segment
            parent_graph.ends_with = new_segment
            new_segment.is_after = None
        else:
            new_segment.is_after = parent_graph.ends_with
            parent_graph.ends_with.is_before = new_segment
            parent_graph.ends_with = new_segment

        parent_graph.number_segments += 1

    def delete_segment(self, parent_graph):
        #cut ties with the model
        parent_graph.ends_with.is_after.is_before = None
        parent_graph.ends_with = parent_graph.ends_with.is_after
            
    def calculate_reply(self, current_graph):
        csv = ''
        points = self.calculate_endpoints(current_graph.ends_with)
        if (current_graph.number_segments > 1 and current_graph.ends_with.start_value == current_graph.ends_with.is_after.end_value):
            points = points[1]
            csv = ','.join('%s'%point for point in points)
        else:
            csv = '\n'.join('%s,%s'%point for point in points)
        return csv

    def calculate_start_time(self,segment):
        if (segment.is_after == None):
            return 0 
        else:
            return segment.is_after.duration + self.calculate_start_time(segment.is_after)

    def calculate_endpoints(self,segment):
        #caluclate starting point
        t = self.calculate_start_time(segment)
        start_point = (t, segment.start_value)

        #calculate end point
        end_point = (t + segment.duration, segment.start_value + segment.rate * segment.duration)

        return (start_point, end_point) 

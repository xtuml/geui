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

    def add_segment(self, parent_graph, start_value, end_value, rate, duration, position):
        new_segment = graphing.segment(start_value, end_value, rate, duration)
        new_segment.graph = parent_graph 
        new_segment.position = position

        if (position == parent_graph.number_segments):
            new_segment.is_before = None

            if (parent_graph.number_segments == 0):
                parent_graph.starts_with = new_segment
                parent_graph.ends_with = new_segment
                new_segment.is_after = None
            else:
                new_segment.is_after = parent_graph.ends_with
                parent_graph.ends_with.is_before = new_segment
                parent_graph.ends_with = new_segment

        else:
            insert_before = self.select_segment(position, parent_graph.starts_with)
            new_segment.is_after = insert_before.is_after
            new_segment.is_before = insert_before
            insert_before.is_after = new_segment
            if (position != 0):
                new_segment.is_after.is_before = new_segment
            self.update_positions(insert_before, 'added')

        parent_graph.number_segments += 1

    def delete_segment(self, parent_graph, position):
        to_delete = self.select_segment(position, parent_graph.starts_with)
        #cut ties with the model
        if (to_delete != parent_graph.starts_with):
            to_delete.is_after.is_before = to_delete.is_before
        else:
            parent_graph.starts_with = to_delete.is_before
        if (to_delete != parent_graph.ends_with):
            to_delete.is_before.is_after = to_delete.is_after
        else:
            parent_graph.ends_with = to_delete.is_after
        self.update_positions(to_delete.is_before, 'deleted')
        to_delete.is_before = None
        to_delete.is_after = None
        to_delete.graph = None
        parent_graph.number_segments -= 1
            

    def select_segment(self, position, start_segment):
        if (start_segment.position == position):
            return start_segment
        elif (start_segment.position > position):
            return self.select_segment(position, start_segment.is_after)
        else:
            return self.select_segment(position, start_segment.is_before)

    def update_positions(self, start_segment, action):
        if (start_segment != None):
            if (action == 'added'):
                start_segment.position += 1
            else:
                start_segment.position -= 1
            self.update_positions(start_segment.is_before, action)
        else:
            pass
            
    def calculate_reply(self, current_graph, position):
        csv = ''
        print current_graph.starts_with, current_graph.ends_with
        start_segment = self.select_segment(position, current_graph.starts_with)
        points = []
        self.get_points_from_segment(points, start_segment)
        if (position != 0):
            end_point = self.calculate_endpoints(start_segment.is_after)[1]
            d = -1
            for (c,point) in enumerate(points):
                if (point == end_point):
                    d = c
            if (d != -1):
                del points[d]
                    
        print points

        #if (current_graph.number_segments > 1 and current_graph.ends_with.start_value == current_graph.ends_with.is_after.end_value):
        #    points = points[1]
        #    csv = ','.join('%s'%point for point in points)
        #else:
        #    csv = '\n'.join('%s,%s'%point for point in points)
        
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

    def get_points_from_segment(self, point_list, segment):
        if (segment != None):
            test_points = [self.calculate_endpoints(segment)[0], self.calculate_endpoints(segment)[1]]
            for test_point in test_points:
                add = True
                for point in point_list:
                    if test_point == point:
                        add = False
                if (add == True):
                    point_list.append(test_point)
                
            self.get_points_from_segment(point_list, segment.is_before)
        else:
            pass

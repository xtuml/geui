import web
import graphing
import gnosis.xml.pickle

class ReplyCalculator:

    def calculate_reply(self, current_graph, pos):
        csv = ''
        if (pos < len(current_graph.contents)):
            start_segment = current_graph.contents[pos] 
            points = []
            self.get_points_from_segment(points, start_segment)
            if (pos != 0):
                end_point = self.calculate_endpoints(current_graph.contents[pos - 1])[1]
                d = -1
                for (c,point) in enumerate(points):
                    if (point == end_point):
                        d = c
                if (d != -1):
                    del points[d]
                        
            
            csv = '\n'.join('%s,%s'%point for point in points)
        return csv

    def calculate_start_time(self,segment):
        graph = segment.graph
        pos = graph.contents.index(segment)
        if (pos == 0):
            return 0 
        else:
            return graph.contents[pos - 1].duration + self.calculate_start_time(graph.contents[pos - 1])

    def calculate_endpoints(self,segment):
        #caluclate starting point
        t = self.calculate_start_time(segment)
        start_point = (t, segment.start_value)

        #calculate end point
        end_point = (t + segment.duration, segment.end_value)

        return (start_point, end_point) 

    def get_points_from_segment(self, point_list, segment):
        #checks for redundant points starting at one segment and going through to the end of the graph
        test_points = [self.calculate_endpoints(segment)[0], self.calculate_endpoints(segment)[1]]
        for test_point in test_points:
            add = True
            for point in point_list:
                if test_point == point:
                    add = False
            if (add == True):
                point_list.append(test_point)
        
        if (segment.graph.contents.index(segment) + 1 < len(segment.graph.contents)):
            self.get_points_from_segment(point_list, segment.graph.contents[segment.graph.contents.index(segment) + 1])
        else:
            pass

    def calculate_table_reply(self, current_graph):
        reply = ''
        if (len(current_graph.contents) != 0):
            param_list = []
            self.get_parameters(param_list, current_graph.contents[0])

            #calculate csv  string
            reply = '\n'.join('%s,%s,%s,%s'%param_set for param_set in param_list)
        return reply
            
    def get_parameters(self, param_list, segment):
        param_list.append((segment.start_value, segment.end_value, segment.rate, segment.duration))
        if (segment.graph.contents.index(segment) + 1 < len(segment.graph.contents)):
            self.get_parameters(param_list, segment.graph.contents[segment.graph.contents.index(segment) + 1])
        else:
            pass

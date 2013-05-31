import web
import graphing
import gnosis.xml.pickle

class ReplyCalculator:

    def calculate_reply(self, old_vertices, new_vertices):
        #points to delete
        delete = 0
        add = []
        if len(old_vertices) > len(new_vertices):
            delete = len(old_vertices) - len(new_vertices)
            while len(new_vertices) != len(old_vertices): 
                old_vertices.pop(len(old_vertices)-1)
            
        #points to add 
        elif len(new_vertices) > len(old_vertices):
            while len(new_vertices) != len(old_vertices): 
                add.insert(0, new_vertices.pop(len(new_vertices)-1))

        #diff the two vertex sets
        diff = []
        i = 0
        while i < len(old_vertices):
            n = 0
            while n < 2:
                if old_vertices[i][n] != new_vertices[i][n]:
                    diff.append((2*i+n,new_vertices[i][n]))
                else:
                    pass
                n += 1
            i += 1
            
        #print delete, add, diff 

        #create_string
        reply = 'delete=' + str(delete) + '&'
        if not add:
            reply += 'add=None&'
        else:
            reply += 'add=' + '\n'.join('%s,%s\n%s,%s'%(segment[0][0],segment[0][1],segment[1][0],segment[1][1]) for segment in add) + '&'
        if not diff:
            reply += 'update=None'
        else:
            reply += 'update=' + '\n'.join('%s,%s,%s'%(p[0],p[1][0],p[1][1]) for p in diff)
        
        return reply 
        

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

    def add_points(self, pos, segment, vertices):
        new_points = self.calculate_endpoints(segment)
        vertices.insert(pos, new_points)
        
    def remove_points(self, pos, graph, vertices):
        vertices.pop(pos)
        if (pos < len(vertices)):
            self.update_point(pos, graph.contents[pos])

    def update_point(self, pos, segment):
        updated_point = self.calculate_endpoints(segment)
        segment.graph.vertices.pop(pos)
        segment.graph.vertices.insert(pos, updated_point)
        if (pos != len(segment.graph.contents) - 1):
            self.update_point(pos + 1, segment.graph.contents[pos + 1])


import gnosis.xml.pickle

#data model for an experiment
class Experiment:

    name = ''
    
    graph = None

    def __init__(self, graph=None, name=''):
       self.graph = graph
       self.name = name

    #public static method to create an experiment
    @staticmethod
    def create(name):
        new_graph = Graph() 
        return Experiment(new_graph, name)

    #public static method to open an experiment with an experiment name
    @staticmethod
    def open(name):
        #open experiment
        #open a saved file
        try:
            saved_file = open('data/'+name+'.xml','r')
            xml_string = saved_file.read()
            saved_file.close()
            return gnosis.xml.pickle.loads(xml_string)

        except IOError:
            return None

    #dump to xml file
    def save(self):
        #save the file 
        save_file = open('data/'+name+'.xml','w')
        save_file.write(gnosis.xml.pickle.dumps(self))
        save_file.close()

    #replies to the client points to delete, add, and update
    def calculate_reply(self, old_vertices, new_vertices):

        delete = 0
        add = []
        update = []

        #points to delete -- if there is a net loss of vertices, deletes the last ones
        #and counts how many it deleted
        if len(old_vertices) > len(new_vertices):
            while len(new_vertices) != len(old_vertices): 
                old_vertices.pop(len(old_vertices)-1)
                delete += 1
            
        #points to add -- if there is a net gain of vertices, pops the last ones
        #and adds them to an array to return
        elif len(new_vertices) > len(old_vertices):
            while len(new_vertices) != len(old_vertices): 
                add.insert(0, new_vertices.pop(len(new_vertices)-1))

        #diff the two vertex sets -- resulting array is in form [index_to_update:int, vertex:Vertex]
        for i, vertex in enumerate(old_vertices): #for loop with an index, i and value, vertex
            if old_vertices[i].x != new_vertices[i].x or old_vertices[i].y != new_vertices[i].y:
                update.append((i,new_vertices[i]))

        #print delete, add, diff   #print the ouptuts to test

        #create reply string
        reply = ''

        #write deletes
        reply = 'delete=' + str(delete) + '&'

        #write adds
        if not add:
            reply += 'add=None&'
        else:
            reply += 'add=' + '\n'.join('%s,%s'%(vertex.x, vertex.y) for vertex in add) + '&'

        #write updates 
        if not update:
            reply += 'update=None'
        else:
            reply += 'update=' + '\n'.join('%s,%s,%s'%(entry[0], entry[1].x, entry[1].y) for entry  in update)

        return reply

    #returns values to populate the clients table in csv format
    def calculate_table_reply(self):
        reply = ''
        if (len(self.graph.contents) != 0):
            param_list = []
            for segment in current_graph.contents:
                param_list.append((segment.start_value, segment.end_value, segment.rate, segment.duration))

            #calculate csv  string
            reply = '\n'.join('%s,%s,%s,%s'%param_set for param_set in param_list)
        return reply
        

class Graph:
    
    contents = []

    def __init__(self):
        self.contents = []

    #adds a segment to the graph's contents at the specified position
    def add_segment(self, values, position):
        new_segment = Segment(values, self)
        new_segment.parent = self
        self.contents.insert(position, new_segment)
        if position < len(self.contents):
            self.update_points(position)
        
    #deletes segment from the graph's contents at the specified position
    def delete_segment(self, position):
        self.contents.pop(position)    
        if position < len(self.contents):
            self.update_points(position)

    #moves a segment from the given position to the given destination
    def move_segment(self, position, destination):
        temp_segment = self.contents.pop(position)
        self.contents.insert(destination, temp_segment)
        if position < destination:
            self.update_points(position)
        else:
            self.update_points(destination)

    #returns array of vertices from the graph (some duplicates because each segment has exactly 2 endpoints)
    def get_vertices(self):
        vertices = []
        for segment in self.contents:
            for vertex in segment.vertices:
                vertices.append(Vertex(None, 0, vertex.x,vertex.y))
        return vertices

    #updates the points that got moved below given position
    def update_points(self, position):
        for vertex in self.contents[position].vertices:
            vertex.update()
        if position < len(self.contents) - 1:
            self.update_points(position + 1)

class Segment:

    parent = None

    vertices = []

    start_value = 0
    end_value = 0
    rate = 0
    duration = 0

    def __init__(self, values, parent):
        self.parent = parent
        self.start_value = values[0]
        self.end_value = values[1]
        self.rate = values[2]
        self.duration = values[3]
        self.vertices = [Vertex(self, 1), Vertex(self, 2 )]

    #updates a segment's values
    def update(self, values):
        self.start_value = values[0]
        self.end_value = values[1]
        self.rate = values[2]
        if self.duration != values[3]:
            self.duration = values[3]
            self.parent.update_points(self.parent.contents.index(self))
        for vertex in self.vertices:
            vertex.update()

    #calculate start time
    def calculate_start_time(self):
        position = self.parent.contents.index(self)
        if position > 0:
            return self.parent.contents[position - 1].calculate_start_time() + self.parent.contents[position - 1].duration
        else:
            return 0

class Pattern:
    
    parent = None
    contents = []

    def __init__(self):
        self.contents = [] 

class Vertex:

    x = 0
    y = 0

    segment = None
    v_num = 0       #1 or 2. 1 for first vertex, 2 for second vertex in a segment

    def __init__(self, segment, v_num, x=0, y=0):
        self.segment = segment
        self.v_num = v_num
        self.x = x
        self.y = y

    def update(self):
        if self.v_num == 1:
            self.x = self.segment.calculate_start_time()
            self.y = self.segment.start_value
        else:
            self.x = self.segment.calculate_start_time() + self.segment.duration
            self.y = self.segment.end_value

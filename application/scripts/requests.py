import web
import handler
import replies
import csv

handler = handler.GraphHandler()
replier = replies.ReplyCalculator()

class AddSegment:

    def POST(self):
        form = web.input()

        current_graph = handler.open_model()
        old_vertices = list(current_graph.vertices)
        position = int(form.position)
        handler.add_segment(current_graph, float(form.start_value), float(form.end_value), float(form.rate), float(form.duration), position)
        handler.update_model(current_graph)
        reply = replier.calculate_reply(old_vertices, current_graph.vertices)
        #print reply
        return reply

class DeleteSegment:

    def POST(self):
        csv = web.data()
        
        #parse csv
        to_delete = [] 
        new_string = ''
        for letter in csv:
            if letter == ',':
                to_delete.append(int(new_string))
                new_string = ''
            else:
                new_string += letter
        if new_string != '':
            to_delete.append(int(new_string))
                
        current_graph = handler.open_model()
        old_vertices = list(current_graph.vertices)
        for seg in to_delete:
            handler.delete_segment(current_graph, seg)
        handler.update_model(current_graph)
        reply = replier.calculate_reply(old_vertices, current_graph.vertices)
        #print reply
        return reply


class UpdateSegment:

    def POST(self):
        form = web.input()
        current_graph = handler.open_model()
        old_vertices = list(current_graph.vertices)
        position = int(form.position)
        handler.update_segment(current_graph, float(form.start_value), float(form.end_value), float(form.rate), float(form.duration), position)
        handler.update_model(current_graph)
        reply = replier.calculate_reply(old_vertices, current_graph.vertices)
        #print reply
        return reply

class SwitchSegment:
    
    def POST(self):
        csv = web.data()
        segs = []
        new_data = ''
        for letter in csv:
            if letter == ',':
                segs.append(int(new_data))
                new_data = ''
            else:
                new_data += letter
        if new_data != '':
            segs.append(int(new_data))

        print csv,segs
        current_graph = handler.open_model()
        old_vertices = list(current_graph.vertices)
        handler.switch_segment(current_graph,segs[0],segs[1])
        handler.update_model(current_graph)
        reply = replier.calculate_reply(old_vertices, current_graph.vertices)
        #print reply
        return reply

class OpenFile:
  
    def POST(self):
        current_graph = handler.open_model()
        return replier.calculate_reply([], current_graph.vertices)

class OpenTable:

    def POST(self):
        current_graph = handler.open_model()
        return replier.calculate_table_reply(current_graph)

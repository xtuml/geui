import web
import handler
import replies

handler = handler.GraphHandler()
replier = replies.ReplyCalculator()

class AddSegment:

    def POST(self):
        form = web.input()
        
        current_graph = handler.open_model()
        position = int(form.position)
        handler.add_segment(current_graph, float(form.start_value), float(form.end_value), float(form.rate), float(form.duration), position)
        handler.update_model(current_graph)
        return replier.calculate_reply(current_graph, position)

class DeleteSegment:

    def POST(self):
        current_graph = handler.open_model()
        if (web.data() == ''):
            position = len(current_graph.contents) - 1
        else:
            position = int(web.data())
        reply = replier.calculate_reply(current_graph, position)
        handler.delete_segment(current_graph, position)
        handler.update_model(current_graph)
        return reply 

class OpenFile:
  
    def POST(self):
        current_graph = handler.open_model()
        return replier.calculate_reply(current_graph, 0)

class OpenTable:

    def POST(self):
        current_graph = handler.open_model()
        return replier.calculate_table_reply(current_graph)

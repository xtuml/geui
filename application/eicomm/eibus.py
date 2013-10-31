# eibus interface for communicating to the embedded code on the device

class EIbus:

    #----- SIGNALS TO EC -----#

    # get version command sent from agent
    def get_version(self):
        raise NotImplementedError

    # wave download
    def wave(self, data):
        raise NotImplementedError

    # data acquisition download
    def dacq(self, data):
        raise NotImplementedError

    # initial conditions download
    def conditions(self, data):
        raise NotImplementedError

    # run current experiment
    def run_experiment(self):
        raise NotImplementedError


    #----- SIGNALS TO AGENT -----#

    # version response from EC
    def version(self, data):
        raise NotImplementedError

    # data packet from EC
    def data(self, data):
        raise NotImplementedError

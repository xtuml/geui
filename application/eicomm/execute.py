from subprocess import call

def run(command):

    #process command
    cmd = command.split()

    #execute command
    call(cmd)

if __name__ == '__main__':
    import sys
    if (len(sys.argv) > 1):
        command = ''
        for arg in sys.argv[1:]:
            command += str(arg) + ' '

        run(command[:-1])
    else:
        print 'Must enter a command'

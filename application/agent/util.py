#function for coverting an array of arguments into separate arguments
#the first item in the array is a function call, all others are arguments
def call(args):

    #call a function with no arguments
    if len(args) == 1:
        args[0]()

    #call a function with 1 argument
    elif len(args) == 2:
        args[0](args[1])

    #call a function with 2 arguments
    elif len(args) == 3:
        args[0](args[1], args[2])

    #call a function with 3 arguments
    elif len(args) == 4:
        args[0](args[1], args[2], args[3])

    #call a function with 4 arguments
    elif len(args) == 5:
        args[0](args[1], args[2], args[3], args[4])

    #call a function with 5 arguments
    elif len(args) == 6:
        args[0](args[1], args[2], args[3], args[4], args[5])

    #call a function with 6 arguments
    elif len(args) == 7:
        args[0](args[1], args[2], args[3], args[4], args[5], args[6])

    else:
        pass

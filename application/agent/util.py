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

#function to convert an integer to an array of bytes (in integer form 0 <= num < 256)
def tobytes(value, num_bytes=0, little_endian=True):
    import math
    byte_array = []
    num_need = int(math.ceil(float(math.log(value + 1, 256))))  #find number of bytes needed
    while num_need > 0:
        num_need -= 1                                           #num_need becomes multiplying factor to separate bytes
        byte_array.append(int(math.floor(float(value / (256 ** num_need)))))
        value = value % (256 ** num_need)

    #add empty bytes to fill requirements
    #if no num_bytes is specified, no extra zeroes will be added
    while len(byte_array) < num_bytes:
        byte_array.insert(0, 0)

    #adjust endianness
    if little_endian == True:
        byte_array.reverse()

    return byte_array

def toint(byte_array, little_endian=True): 
    #adjust endianness 
    if little_endian == False: 
        byte_array.reverse() 
 
    #unpack 
    int_value = 0 
    for n, value in enumerate(byte_array): 
        int_value += 256**n * value 
 
    return int_value 

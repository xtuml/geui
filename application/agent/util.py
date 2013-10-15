# function for coverting an array of arguments into separate arguments
# the first item in the array is a function call, all others are arguments
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

# function to convert an integer to an array of bytes (in integer form 0 <= num < 256)
def tobytes(value, num_bytes, signed=False, little_endian=True):
    # num_bytes has a max value of 4 bytes. After that, I'm not sure what Python does with "long" values
    if (num_bytes > 4):
        return None

    if (value < 0):                 # convert value into a positive integer and set signed to True
        value *= -1
        value = ~(value) + 1        # perform two's complement
        signed = True

    # check to make sure number fits in num_bytes
    if (value >= 256 ** num_bytes - 1):
        return None

    else:
        byte_array = []
        mask = 255
        i = 0
        while (i < num_bytes):
            if (little_endian):
                byte_array.append((value & mask) >> (8 * i))        # use 8 bit 1's mask to pull out one byte at a time
            else:
                byte_array.insert(0, (value & mask) >> (8 * i))     # use 8 bit 1's mask to pull out one byte at a time
            mask = mask << 8
            i += 1

        return byte_array

# function to convert an array of bytes into an integer
def toint(byte_array, signed=False, little_endian=True):
    value = 0
    n = 0
    while n < len(byte_array):
        if (little_endian):
            value += byte_array[n] << (8 * n)
        else:
            value += byte_array[len(byte_array) - n - 1] << (8 * n)
        n += 1

    if (signed and value > (2 ** ((len(byte_array) * 8) - 1) - 1)):
        value = ~(value - 1)        # perform backwards two's complement
        mask = 2 ** (len(byte_array) * 8) - 1       # mask out extra one's left over
        value = value & mask
        value *= -1

    return value

//----------------------------------------//
Agent emulator for socket testing
//----------------------------------------//

USAGE:

1.  Run main.py
2.  main.py will attempt to connect to 'localhost' on port 9000.
3.  Run a socket server (or loopback.py)
4.  Press <Enter> in main.py to send a get_version command across
    the socket [0x01, 0x00, 0x00] (as defined in file_formats)
5.  If a version response is received across the socket, main.py will
    interperet and print it to the console
6.  Type 'exit' to terminate main.py

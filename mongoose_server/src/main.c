/**
 *  Mongoose Demo Server
 *  ====================
 *  Waits until it receives an HTTP request to spawn the python server. When the python server has started,
 *  a message is sent back to the client indicating it's OK to redirect to the agent.
 *
 *  USAGE:
 *  demo_server -P <port number> -d <directory containing geui.py> [-p <python port>] [-t <timeout in milliseconds>]
 *
 *  Error codes:
 *  1 ----------------- Argument error
 *  2 ----------------- Log file error
 *  3 ----------------- Python execution error
 *  4 ----------------- Forking failure
 *  5 ----------------- Could not change directory
 *
 */


#include <sys/types.h>
#include <sys/stat.h>
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <math.h>
#include <errno.h>
#include <unistd.h>
#include <time.h>
#include <syslog.h>
#include <string.h>
#include "mongoose.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>

#define TARGET_URI "/start_server"      // request to start server
#define MAX_FILE_SIZE 5000              // 5 KB log file

// mongoose options
int port = 0;           // port to run the mongoose service on          (required)
char* str_port;         // string version of the port number
char* dir = NULL;       // directory to work from                       (required)

// python options
int app_port = 8080;    // port to start the python server on           (default: 8080)
int timeout = 0;        // number of milliseconds before idle timeout   (default: 0)

// log file
FILE* log_file;
time_t curr_time;       // time stamp for logging

// boolean to control exiting smoothly
int running = 1;

void check_log() {
    // find file size
    int size = ftell(log_file);

    // if it's too big, rotate logs
    if (size > MAX_FILE_SIZE) {
        // close old log
        int c = fclose(log_file);
        if (c == EOF) exit(2);      // failed to close file

        // remove an old old log
        remove("mongoose.log.1");

        // rename old log
        int r = rename("mongoose.log", "mongoose.log.1");
        if (r) exit(2);             // failed to rename log file

        // open new log
        log_file = fopen("mongoose.log", "a");
        if (!log_file) exit(2);          // could not open log file

    }

}

// Check if a port is available (used to check if the server is already running)
int port_available(int portno) {
    int available = 0;
    char *hostname = "localhost";

    int sockfd;
    struct sockaddr_in serv_addr;
    struct hostent *server;
    
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        printf("ERROR opening socket\n");
        //error("ERROR opening socket");
    }
                                                    
    server = gethostbyname(hostname);
                                                         
    if (server == NULL) {
        fprintf(stderr,"ERROR, no such host\n");
        exit(0);
    }
                                                                                      
    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    bcopy((char *)server->h_addr, (char *)&serv_addr.sin_addr.s_addr, server->h_length);
    
    serv_addr.sin_port = htons(portno);
    if (connect(sockfd,(struct sockaddr *) &serv_addr,sizeof(serv_addr)) < 0) {
        available = 1;
    }
    
    close(sockfd);
    
    return available;
}

void start_server(struct mg_connection *conn) {
    curr_time = time(NULL);
    fprintf(log_file, "Starting Python server ---- %s", ctime(&curr_time));
    check_log();

    // format: "python geui.py -b -t %d -p %d"
    int app_port_len;
    int timeout_len;
    if (app_port) app_port_len = (int) log10(app_port) + 1;
    else app_port_len = 1;
    if (timeout) timeout_len = (int) log10(timeout) + 1;
    else timeout_len = 1;

    int len = 26 + app_port_len + timeout_len;
    char* command = malloc(len * sizeof(char));
    snprintf(command, len, "python geui.py -b -t %d -p %d", timeout, app_port);

    // log command
    curr_time = time(NULL);
    fprintf(log_file, "Executing command '%s' ---- %s", command, ctime(&curr_time));
    check_log();

    // execute the program
    int success = system(command);

    // free data
    free(command);
    command = NULL;

    if (success) {
        // let the client know there was an error
        mg_printf_data(conn, "error", conn->uri);
        exit(3);                // command error
    }

    // log success
    curr_time = time(NULL);
    fprintf(log_file, "Python server running ---- %s", ctime(&curr_time));
    check_log();

    // let the client know it's running
    mg_printf_data(conn, "launch(\"success\");", conn->uri);
}

// Callback if the server receives a request
int ev_handler(struct mg_connection *conn, enum mg_event ev) {
    int result = MG_FALSE;

    if (ev == MG_REQUEST) {

        curr_time = time(NULL);
        fprintf(log_file, "Received request '%s' ---- %s", conn->uri, ctime(&curr_time));
        check_log();

        // start python server
        if (!strcmp(conn->uri, TARGET_URI)) {
            if (port_available(app_port)) start_server(conn);
            else {
                curr_time = time(NULL);
                fprintf(log_file, "Port %d busy. ---- %s", app_port, ctime(&curr_time));
                check_log();
                mg_printf_data(conn, "launch(\"busy\");");
            }
        }

        // exit
        else if (!strcmp(conn->uri, "/done")) {
            running = 0;
            mg_printf_data(conn, "");
        }

        else mg_printf_data(conn, "");

        result = MG_TRUE;
    }
    else if (ev == MG_AUTH) {
        result = MG_TRUE;
    }

    return result;
}

int main(int argc, char** argv) {

    // initialize command line arguments
    for (int i = 0; i < argc; i++) {
        if (!strcmp(argv[i], "-P") && i < argc - 1) {
            port = atoi(argv[i+1]);
            str_port = argv[i+1];
        }
        else if (!strcmp(argv[i], "-d") && i < argc - 1) dir = argv[i+1];
        else if (!strcmp(argv[i], "-p") && i < argc - 1) app_port = atoi(argv[i+1]);
        else if (!strcmp(argv[i], "-t") && i < argc - 1) timeout = atoi(argv[i+1]);
    }

    if (!port || !dir) return 1;        // absence of required args

    if (!app_port) app_port = 8080;     // default

    // fork off main process
    pid_t pid = fork();
    if (pid < 0) return 4;              // fork failure
    else if (pid > 0) return 0;         // exit parent process

    // change the file mode mask
    umask(0);

    // change directory
    if (chdir(dir) < 0) {
        curr_time = time(NULL);
        fprintf(log_file, "Could not change directories. ---- %s", ctime(&curr_time));
        check_log();
        exit(5);
    }

    // initialize logging
    log_file = fopen("mongoose.log", "a");
    if (!log_file) return 2;                 // could not open log file

    // close standard file descriptors
    close(STDIN_FILENO);
    close(STDOUT_FILENO);
    close(STDERR_FILENO);

    // define server
    struct mg_server *server;

    // Create and configure the server
    server = mg_create_server(NULL, ev_handler);
    mg_set_option(server, "listening_port", str_port);

    // Serve request. Hit Ctrl-C to terminate the program
    curr_time = time(NULL);
    fprintf(log_file, "Starting server on port %s ---- %s", mg_get_option(server, "listening_port"), ctime(&curr_time));
    check_log();

    while (running) {
        mg_poll_server(server, 1000);   // poll every second
    }

    // Cleanup, and free server instance
    mg_destroy_server(&server);

    curr_time = time(NULL);
    fprintf(log_file, "Exiting service. ---- %s", ctime(&curr_time));
    check_log();

    // close log
    int c = fclose(log_file);
    if (c == EOF) return 2;         // failed to close file

    return 0;
}

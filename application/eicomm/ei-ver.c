#include <stdlib.h>
#include <stdio.h>

int main (
  int argc,
  char * argv[]
)
{

    char cmd [100];
    int n;
    n = sprintf(cmd, "python -c 'import agent.eibus; agent.eibus.version(\"%s\")'",argv[1]);

    /* Print the command
    printf("%s\n",cmd);
    */

    system(cmd);

}

all: clean mkdir compile

debug: clean mkdir debug_compile

compile: mongoose/mongoose.c src/main.c
	gcc -std=gnu99 -o bin/demo_server mongoose/mongoose.c src/main.c -Imongoose -lm -lpthread

debug_compile: mongoose/mongoose.c src/main.c
	gcc -g -std=gnu99 -o bin/demo_server mongoose/mongoose.c src/main.c -Imongoose -lm -pg -lpthread

clean:
	rm -rf bin

mkdir:
	mkdir bin

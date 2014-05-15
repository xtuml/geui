/*

HTTPcomm class

defines incoming side of the eihttp interface

*/

function start_server() {
    var fileref = document.createElement("script");
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", "http://localhost:8888/start_server");
    document.getElementsByTagName("head")[0].appendChild(fileref);
}

function launch(data) {
    if (data == "success" || data == "busy") {
        //window.location.replace("http://localhost:8080/");
        window.location.href = "http://localhost:8080/";
    }
}

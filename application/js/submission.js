function submitForm(){
    if (
        validateSimple('start_value','integer') &&
        validateSimple('end_value','integer') &&
        validateSimple('rate','integer') &&
        validateSimple('duration','integer') &&
        validateComplex()
    ){
        $.post('/add_segment',$('#user_input').serialize(),function(data){
            updateChart(data);
        });
    }
    else{
    }
}


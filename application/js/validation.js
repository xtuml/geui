var validate_methods = {
    integer: {
        method: function integer(value){
            return /^(0|-?[1-9][0-9]*)$/.test(value);
        },
        message: 'Enter a valid integer'
    },
    real: {
        method: function real(value){
            return /^(((0|-|-?[1-9][0-9]*)?(\.[0-9]*))|(0|-?[1-9][0-9]*))$/.test(value);
        },
        message: 'Enter a valid real'
    },
    positive_real: {
        method: function positive_real(value){
            return /^(((0|[1-9][0-9]*)?(\.[0-9]*))|(0|[1-9][0-9]*))$/.test(value);
        },
        message: 'Enter a positive real'
    }
}

function validateSimple(id_string, method){
    //validation code 
    var value = $.trim($('#'+id_string).val());

    if (value == '' || validate_methods[method]['method'](value)){
        document.getElementById(id_string).parentNode.setAttribute('class','control-group');    
        document.getElementById(id_string).parentNode.parentNode.setAttribute('style','text-align: center; vertical-align: middle; background-color:');    
        document.getElementById(id_string).placeholder = document.getElementById(id_string).default_placeholder;    
        return true;
    }
    else{
        document.getElementById(id_string).placeholder = validate_methods[method]['message'];    
        document.getElementById(id_string).value = '';    
        document.getElementById(id_string).parentNode.setAttribute('class','control-group error');    
        document.getElementById(id_string).parentNode.parentNode.setAttribute('style','text-align: center; vertical-align: middle; background-color: #FFAFAF');
        return false;
    }

}

function validateComplex(){
    //setup
    var fields = {
        start_value: document.getElementById('start_value'),
        end_value: document.getElementById('end_value'),
        rate: document.getElementById('rate'),
        duration: document.getElementById('duration')
    }
    var values = {
        start_value: $.trim(fields['start_value'].value),
        end_value: $.trim(fields['end_value'].value),
        rate: $.trim(fields['rate'].value),
        duration: $.trim(fields['duration'].value)
    }

    //validation code
    var valid = true

    //validate empty fields
    for (var value in values ){
        if (values[value] == ''){
            document.getElementById(value+'_help').innerHTML = 'Must enter a value';    
            $(fields[value]).parents('.control-group').addClass('error');
            valid = false;
        }
    }
    
    if (valid == false){
        return valid;
    }

    //validate interdependencies
    if (values['end_value'] - values['start_value'] != values['rate'] * values['duration']){
        document.getElementById('submit_help').innerHTML = 'Field values must agree';    
        $($('#submit_btn')).parents('.control-group').addClass('error');
        valid = false;
    }
    else{
        document.getElementById('submit_help').innerHTML = '';    
        $($('#submit_btn')).parents('.control-group').removeClass('error');
    }
            
    return valid;
}

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

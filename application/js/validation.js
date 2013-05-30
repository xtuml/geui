var validate_methods = {
    integer: {
        method: function integer(value){
            return /^(0|-?[1-9][0-9]*)$/.test(value);
        },
        message: 'Enter a valid integer'
    },
    real: {
        method: function real(value){
            return /^(0|(-?([1-9][0-9]*)?\.[0-9]*)|(-?[1-9][0-9]*)|(0\.[0-9]*)|(-?0?\.[0-9]*[1-9][0-9]*))$/.test(value);
        },
        message: 'Enter a valid real'
    },
    positive_real: {
        method: function positive_real(value){
            return /^((([1-9][0-9]*)(\.[0-9]*))|(\.[0-9]*[1-9][0-9]*)|([1-9][0-9]*))$/.test(value);
        },
        message: 'Enter a positive real'
    }
}

function validateSimple(id_string, method){
    //validation code 
    var value = $.trim($('#'+id_string).val());

    if (value == '' || validate_methods[method]['method'](value)){
        removeError(id_string, document.getElementById(id_string).default_placeholder);
        return true;
    }
    else{
        setError(id_string, validate_methods[method]['message']);
        return false;
    }

}

function validateComplex(rowCount){
    //setup
    var fields = {
        start_value: document.getElementById('start_value'+rowCount),
        end_value: document.getElementById('end_value'+rowCount),
        rate: document.getElementById('rate'+rowCount),
        duration: document.getElementById('duration'+rowCount)
    }
    var values = {
        start_value: $.trim(fields['start_value'].value),
        end_value: $.trim(fields['end_value'].value),
        rate: $.trim(fields['rate'].value),
        duration: $.trim(fields['duration'].value)
    }

    //validation code
    var valid = true

    //auto fill
    if (values['end_value'] != values['start_value'] && ((values['end_value'] - values['start_value']) / values['rate']) > 0){
        var num_empty = 0;
        var to_fill = '';
        for (var value in values ){
            if (values[value] == ''){
                num_empty += 1;
                to_fill = value;
            }
        }
        if (num_empty == 1){
            if (to_fill == 'start_value'){
                var fill_val = (values['end_value'] - values['rate'] * values['duration']);
            }
            else if (to_fill == 'end_value'){
                var fill_val = (values['start_value'] + values['rate'] * values['duration']);
            }
            else if (to_fill == 'rate'){
                var fill_val = ((values['end_value'] - values['start_value']) / values['duration']);
            }
            else{
                var fill_val = ((values['end_value'] - values['start_value']) / values['rate']);
            }
            fields[to_fill].value = cleanUp(fill_val);
            return true;
        }
    }

    //validate empty fields
    for (var value in values ){
        if (values[value] == ''){
            setError(value+rowCount, 'Must enter a value');
            valid = false;
        }
    }
    
    if (valid == false){
        return valid;
    }

    //validate interdependencies
    if ((values['end_value'] - values['start_value']).toFixed(3) != (values['rate'] * values['duration']).toFixed(3)){
        alert('Field values must agree');
        valid = false;
    }
    else{
    }
            
    return valid;
}

function setError(id_string, message){
    document.getElementById(id_string).placeholder = message;    
    document.getElementById(id_string).value = '';    
    document.getElementById(id_string).parentNode.setAttribute('class','control-group error');    
    document.getElementById(id_string).parentNode.parentNode.setAttribute('style','text-align: center; vertical-align: middle; background-color: #FFAFAF');
}

function removeError(id_string, message){
    document.getElementById(id_string).parentNode.setAttribute('class','control-group');    
    document.getElementById(id_string).parentNode.parentNode.setAttribute('style','text-align: center; vertical-align: middle; background-color:');    
    document.getElementById(id_string).placeholder = message;    
}

function cleanUp(value){ //sets values to 3 decimals
    if (value != '' || value == '0'){
        value = value*1;
        return value.toFixed(3);
    }
    else{
        return ''
    }
}

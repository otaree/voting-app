$(document).ready(function () {
    var optionNo = $(".optionNo").data("optionno");
    $(".add-option").click(function(){
        var addButton = $(this);
        optionNo++;
        var option = '<div class="form-group">';
        var name = 'option_' + optionNo;
        var placeholder = 'Option ' + optionNo;
        option += '<input id="option2" type="text" name="' + name + '" placeholder="' + placeholder + '" class="form-control"/>';
        option += "</div>";
        addButton.before(option);
    });
});
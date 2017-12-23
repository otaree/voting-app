$(document).ready(function () {
    // Delete poll
    $(".delete-poll").click(function() {
        var button = $(this);
        var poll = $(".list-group-item");
        var dataID = {id: button.data("id")};
        console.log(dataID);
        // disabled the submit button
        button.prop("disabled", true);

        $.ajax({
            type: "POST",
            method: 'POST',
            url: "/poll",
            data: dataID,
            success: function (data) {

                button.prop("disabled", false);
                if(data['success']){
                    poll.data("id", dataID.id).remove();
                    alert("SUCCESS");
                }

            },
            error: function (e) {

                alert("Oops! Something went wrong.");
                button.prop("disabled", false);

            }
        });
    });
});
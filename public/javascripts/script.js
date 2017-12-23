$(document).ready(function () {
    var options = [];
    var votes = [];
    var colors = [];

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    var question = $(".question").data("question");
    $(".options").each(function () {
        options.push($(this).data("option"));
        votes.push($(this).data("vote"));
        colors.push(getRandomColor());
    });
    if (question.length > 0) {
        var ctx = document.getElementById("pie-chart");
        ctx.height = 250;

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: options,
                datasets: [{
                    label: "Votes",
                    backgroundColor: colors,
                    data: votes
                }]
            },
            options: {
                title: {
                    display: true,
                    text: question
                },
                //maintainAspectRatio: false,
            }
        });
    }

});
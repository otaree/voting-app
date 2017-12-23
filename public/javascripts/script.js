$(document).ready(function () {
    var options = [];
    var votes = [];
    var colors = [];
    
    // share poll on twitter
    var share = $(".share");
    var shareLink = '';
    shareLink += $(".question").data("question");
    shareLink += " " + share.data("home");
    shareLink += share.data("pollurl");
    share.attr("href", 'https://twitter.com/intent/tweet?hashtags=poll&related=freecodecamp&text=' + shareLink);

    // generate random hex color
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
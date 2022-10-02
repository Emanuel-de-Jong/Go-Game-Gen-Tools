var stats = {};

stats.scoreChartElement = document.getElementById("scoreChart");

stats.rightPercentElement = document.getElementById("rightPercent");
stats.rightStreakElement = document.getElementById("rightStreak");
stats.rightTopStreakElement = document.getElementById("rightTopStreak");

stats.perfectPercentElement = document.getElementById("perfectPercent");
stats.perfectStreakElement = document.getElementById("perfectStreak");
stats.perfectTopStreakElement = document.getElementById("perfectTopStreak");

stats.visitsElement = document.getElementById("visits");

stats.init = function() {
    stats.scoreChart = new Chart(stats.scoreChartElement, {
        type: "line",
        data: {
            datasets: [
                {
                    label: "Winrate B",
                    pointRadius: 1,
                    borderColor: "rgb(0, 255, 0)",
                    backgroundColor: "rgba(0, 255, 0, 0.3)",
                    // fill: {
                    //     target: { value: 50 },
                    // },
                },
                {
                    label: "Score B",
                    yAxisID: 'y1',
                    pointRadius: 1,
                    borderColor: "rgb(0, 0, 255)",
                    backgroundColor: "rgba(0, 0, 255, 0.3)",
                    // fill: {
                    //     target: { value: 0 },
                    // },
                },
            ],
        },
        options: {
            responsive: true,
            // plugins: {
            //     title: {
            //         display: true,
            //         text: "Black",
            //     },
            // },
            interaction: {
                intersect: false,
            },
            animation: {
                duration: 0,
            },
            scales: {
                y: {
                    suggestedMin: 45,
                    suggestedMax: 55,
                    title: {
                        display: true,
                        text: "Winrate B",
                    },
                    afterDataLimits: function(axis) {
                        let maxDiff = axis.max - 50;
                        let minDiff = 50 - axis.min;
                        if (maxDiff > minDiff) {
                            axis.min = 50 - maxDiff;
                        } else if (minDiff > maxDiff) {
                            axis.max = 50 + minDiff;
                        }
                    },
                },
                y1: {
                    position: "right",
                    suggestedMin: -2,
                    suggestedMax: 2,
                    title: {
                        display: true,
                        text: "Score B",
                    },
                    grid: {
                        // drawOnChartArea: false,
                        color: function(context) {
                            if (context.tick.value == 0) return "#000000";
                            return "#ffffff";
                        },
                    },
                    afterDataLimits: function(axis) {
                        if (axis.max > axis.min * -1) {
                            axis.min = axis.max * -1;
                        } else if (axis.min * -1 > axis.max) {
                            axis.max = axis.min * -1;
                        }
                    },
                },
            },
        },
    });
    stats.scoreChartLabels = stats.scoreChart.data.labels;
    stats.scoreChartWinrate = stats.scoreChart.data.datasets[0].data;
    stats.scoreChartScore = stats.scoreChart.data.datasets[1].data;

    stats.total = 0;

    stats.rightCorrect = 0;
    stats.rightStreak = 0;
    stats.rightTopStreak = 0;

    stats.perfectCorrect = 0;
    stats.perfectStreak = 0;
    stats.perfectTopStreak = 0;

    stats.rightPercentElement.innerHTML = "-";
    stats.rightStreakElement.innerHTML = 0;
    stats.rightTopStreakElement.innerHTML = 0;

    stats.perfectPercentElement.innerHTML = "-";
    stats.perfectStreakElement.innerHTML = 0;
    stats.perfectTopStreakElement.innerHTML = 0;
    
    stats.visitsElement.innerHTML = "";
};

stats.updateScore = function(suggestion) {
    stats.scoreChartLabels.push(board.getMoveNumber());

    let winrate = suggestion.winrate.toFixed(2);
    winrate = board.lastColor() == -1 ? winrate : 100 - winrate;
    stats.scoreChartWinrate.push(winrate);

    let score = suggestion.scoreLead.toFixed(1);
    score = board.lastColor() == -1 ? score : score * -1;
    stats.scoreChartScore.push(score);

    stats.scoreChart.update();
};

stats.updateRatio = function(isRight, isPerfect) {
    stats.total++;

    if (isRight) {
        stats.rightCorrect++;
        stats.rightStreak++;
        if (stats.rightStreak > stats.rightTopStreak) {
            stats.rightTopStreak = stats.rightStreak;
        }
    } else {
        stats.rightStreak = 0;
    }

    if (isPerfect) {
        stats.perfectCorrect++;
        stats.perfectStreak++;
        if (stats.perfectStreak > stats.perfectTopStreak) {
            stats.perfectTopStreak = stats.perfectStreak;
        }
    } else {
        stats.perfectStreak = 0;
    }

    stats.rightPercentElement.innerHTML = Math.round((stats.rightCorrect / stats.total) * 100);
    stats.rightStreakElement.innerHTML = stats.rightStreak;
    stats.rightTopStreakElement.innerHTML = stats.rightTopStreak;

    stats.perfectPercentElement.innerHTML = Math.round((stats.perfectCorrect / stats.total) * 100);
    stats.perfectStreakElement.innerHTML = stats.perfectStreak;
    stats.perfectTopStreakElement.innerHTML = stats.perfectTopStreak;
};

stats.setVisits = function(suggestions) {
	let visitsHtml = "";
    for (let i=0; i<suggestions.length; i++) {
		visitsHtml += "<div>" + String.fromCharCode(i + 65) + ": " + suggestions[i].visits + "</div>";
	}
    stats.visitsElement.innerHTML = visitsHtml;
};
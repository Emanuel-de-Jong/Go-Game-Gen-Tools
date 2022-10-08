var stats = {};

stats.scoreChartElement = document.getElementById("scoreChart");

stats.rightPercentElement = document.getElementById("rightPercent");
stats.rightStreakElement = document.getElementById("rightStreak");
stats.rightTopStreakElement = document.getElementById("rightTopStreak");

stats.perfectPercentElement = document.getElementById("perfectPercent");
stats.perfectStreakElement = document.getElementById("perfectStreak");
stats.perfectTopStreakElement = document.getElementById("perfectTopStreak");

stats.visitsElement = document.getElementById("visits");

stats.resultDivElement = document.getElementById("resultDiv");
stats.resultElement = document.getElementById("result");

stats.scoreChart = new Chart(stats.scoreChartElement, {
    type: "line",
    data: {
        datasets: [
            {
                label: "Winrate",
                pointRadius: 1,
                borderColor: "rgb(0, 255, 0)",
                backgroundColor: "rgba(0, 255, 0, 0.3)",
                // fill: {
                //     target: { value: 50 },
                // },
            },
            {
                label: "Score",
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
        plugins: {
            legend: {
                onClick: (event, legendItem, legend) => {
                    const datasets = legend.legendItems.map((dataset, index) => {
                        return dataset.text;
                    });
                    const index = datasets.indexOf(legendItem.text);
                    if (legend.chart.isDatasetVisible(index) === true) {
                        legend.chart.hide(index);
                    } else {
                        legend.chart.show(index);
                    }
                },
                labels: {
                    generateLabels: (chart) => {
                        let visibility = [];
                        for (let i=0; i<chart.data.datasets.length; i++) {
                            if (chart.isDatasetVisible(i) === false) {
                                visibility.push(true);
                            } else {
                                visibility.push(false);
                            }
                        }
                        return chart.data.datasets.map(
                            (dataset, index) => ({
                                text: dataset.label + (dataset.data.length ? ": " + dataset.data.slice(-1) : ""),
                                fillStyle: dataset.backgroundColor,
                                strokeStyle: dataset.borderColor,
                                hidden: visibility[index]
                            })
                        )
                    }
                },
            },
        },
        interaction: {
            intersect: false,
            mode: "index",
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
                    text: "Winrate",
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
                    text: "Score",
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
stats.scoreChart.canvas.onclick = (click) => {
    const points = stats.scoreChart.getElementsAtEventForMode(click, "nearest", { intersect: false }, true);
    if (points[0]) {
        board.goToNode(stats.scoreChartLabels[points[0].index]);
    }
};

stats.scoreChartLabels = stats.scoreChart.data.labels;
stats.scoreChartWinrate = stats.scoreChart.data.datasets[0].data;
stats.scoreChartScore = stats.scoreChart.data.datasets[1].data;

stats.init = function() {
    stats.clearScoreChart();

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

    stats.resultElement.innerHTML = "";
    stats.resultDivElement.hidden = true;
};

stats.updateScoreChart = function(suggestion) {
    let moveNumber = board.getMoveNumber();
    if (stats.scoreChartLabels.includes(moveNumber)) return;

    let index;
    for (index=0; index<stats.scoreChartLabels.length; index++) {
        if (stats.scoreChartLabels[index] > moveNumber) {
            break;
        }
    }

    stats.scoreChartLabels.splice(index, 0, moveNumber);

    let winrate = suggestion.winrate;
    winrate = suggestion.color == settings.scoreChartColorElement.value ? winrate : 100 - winrate;
    stats.scoreChartWinrate.splice(index, 0, winrate.toFixed(2));

    let score = suggestion.scoreLead;
    score = suggestion.color == settings.scoreChartColorElement.value ? score : score * -1;
    stats.scoreChartScore.splice(index, 0, score.toFixed(1));

    stats.scoreChart.update();
};

stats.scoreChartColorElementInputListener = function() {
    for (let i=0; i<stats.scoreChartWinrate.length; i++) {
        let winrate = stats.scoreChartWinrate[i];
        if (winrate > 50) {
            winrate = 50 - (winrate - 50);
        } else {
            winrate = 50 + (50 - winrate);
        }
        stats.scoreChartWinrate[i] = winrate;
    }

    for (let i=0; i<stats.scoreChartScore.length; i++) {
        stats.scoreChartScore[i] = stats.scoreChartScore[i] * -1;
    }

    stats.scoreChart.update();
};
settings.scoreChartColorElement.addEventListener("input", settings.scoreChartColorElementInputListener);

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

stats.updateResult = function(suggestion) {
    let result;
    if (suggestion.scoreLead >= 0) {
        result = utils.colorNumToName(suggestion.color) + "+" + suggestion.scoreLead;
    } else {
        result = utils.colorNumToName(suggestion.color * -1) + "+" + (suggestion.scoreLead * -1);
    }

    stats.setResult(result);

    return result;
}

stats.setResult = function(result) {
    stats.resultDivElement.hidden = false;
    stats.resultElement.innerHTML = result;
}

stats.clearScoreChart = function() {
    stats.scoreChartLabels.length = 0;
    stats.scoreChartWinrate.length = 0;
    stats.scoreChartScore.length = 0;
    stats.scoreChart.update();
}
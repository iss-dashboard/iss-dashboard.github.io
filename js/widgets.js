const widgetContainer = document.querySelector("#widget-container");

const eventConsole = document.querySelector("#event-console");
const cabinTemperature = document.querySelector("#cabin-temperature");
const cabinPressure = document.querySelector("#cabin-pressure");
const loac = document.querySelector("#LOAC");
const pissOMeter = document.querySelector("#piss_o_meter");
const altitudeGraph = document.querySelector("#altitude-graph");

const view3D = document.querySelector("#view-3D");

for (const widget of widgetContainer.children) {
    setTitle(widget);
}

let xState = 0.0;
let yState = 0.0;
let zState = 0.0;

let xUpToDate = true;
let yUpToDate = true;
let zUpToDate = true;

let altitude = 0;
let t = 0;
let lastAltitudeUpdate = Date.now();
let altitudesInterval = [];
let altitudesDelays = [];

const ctx = document.getElementById('altitude-canvas');

const altitudeChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: []
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Seconds ago",
                    color: "white",
                    font: {
                        family: "monospace"
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        devicePixelRatio: 4,
        aspectRatio: () => altitudeGraph.offsetWidth / altitudeGraph.offsetHeight
    }
});



function updateTelemetry(update) {
    widgetUpdaters[update.getItemName()](update.getValue("Value"));
    /*const updateMessage = document.createElement("p");
    updateMessage.innerHTML = update.getItemName() + " " + update.getValue("Value");
    eventConsole.appendChild(updateMessage);
    eventConsole.scrollTop = eventConsole.scrollHeight;*/
}

function idToTitle(widgetid) {
    const words = widgetid.split("-");
    const firstWord = words[0];

    words[0] = firstWord[0].toUpperCase() + firstWord.slice(1);
    for (const i in words) {
        words[i] = words[i].replaceAll("_", "-");
    }
    return words.join(" ");
}

function setTitle(widget) {
    const widgetTitle = document.createElement("legend");
    widgetTitle.classList.add("widget-title");
    widgetTitle.innerHTML = idToTitle(widget.id);
    widget.appendChild(widgetTitle);
}

function torrToHPa(x) {
    return (x * 1013.25) / 760;
}

function roundToLowestAbsVal(x) {
    return x >= 0 ? Math.floor(x) : -Math.floor(-x);
}

function toDMSString(angle) {
    const degrees = roundToLowestAbsVal(angle);
    const minutes = roundToLowestAbsVal((angle - degrees) * 60);
    const seconds = roundToLowestAbsVal((angle - degrees - minutes / 60) * 3600);

    const formatDeg = (x) => String(x).padStart(2, "0");
    return `${formatDeg(degrees)}° ${formatDeg(Math.abs(minutes))}' ${formatDeg(Math.abs(seconds))}"`;
}

function convertCoords(latitude, longitude) {
    const northSouth = latitude >= 0.0 ? " N" : " S";
    const eastWest = longitude >= 0.0 ? " E" : " W";

    const absLatitude = Math.abs(latitude);
    const absLongitude = Math.abs(longitude);
    return {
        latitude: toDMSString(absLatitude),
        longitude: toDMSString(absLongitude),

        northSouth: northSouth,
        eastWest: eastWest
    };
}

function graphSecondsToMinutes() {
    let oldData = altitudeChart.data.datasets[0].data;
    const oldToNewRatio = 60000 / altitudeUpdateInterval;
    
    altitudeChart.options.scales.x.title.text = "Minutes ago";
    altitudeChart.data.labels = [];
    altitudeChart.data.datasets[0].data = [];


    for (let i = t / 60 - 1; i >= 0; i--) {
        altitudeChart.data.labels.push(i);
        let s = 0;
        for (let j = 0; j < oldToNewRatio; j++) {
            s += oldData.pop();
        }
        altitudeChart.data.datasets[0].data.push(s / oldToNewRatio);
    }

    altitudeChart.data.datasets[0].data.reverse();

    altitudeChart.update();
}
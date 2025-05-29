const widgetContainer = document.querySelector("#widget-container");

const eventConsole = document.querySelector("#event-console");
const cabinTemperature = document.querySelector("#cabin-temperature");
const cabinPressure = document.querySelector("#cabin-pressure");
const loac = document.querySelector("#LOAC");
const pissOMeter = document.querySelector("#piss_o_meter");
const altitudeGraph = document.querySelector("#altitude-graph");
const robotics = document.querySelector("#robotics");
const view3D = document.querySelector("#view-3D");
const various = document.querySelector("#various");

const SEA_LEVEL_AIR_PRESSURE = 1013.25;

for (const widget of widgetContainer.children) {
    if (widget.tagName === "FIELDSET") {
        setTitle(widget);
    }
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

let lastSSRMSMovementUpdate = -1;
let lastSPDM1MovementUpdate = -1;
let lastSPDM2MovementUpdate = -1;

let q0;
let q1;
let q2;
let q3;

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

function toYawPitchRoll(q0, q1, q2, q3) {
    var c12 = 2 * (q1 * q2 + q0 * q3);
    var c11 = q0 * q0 + q1 * q1 - q2 * q2 - q3 * q3;
    var c13 = 2 * (q1 * q3 - q0 * q2);
    var c23 = 2 * (q2 * q3 + q0 * q1);
    var c33 = q0 * q0 - q1 * q1 - q2 * q2 + q3 * q3;
    var c22 = q0 * q0 - q1 * q1 + q2 * q2 - q3 * q3;
    var c21 = 2 * (q1 * q2 - q0 * q3);
    var mag_c13 = Math.abs(c13); //all c's should be in radians

    yaw = 0.0;
    pitch = 0.0;
    roll = 0.0;

    if (mag_c13 < 1)
    {
        yaw = Math.atan2(c12, c11);
        pitch = Math.atan2(-c13, Math.sqrt(1.0 - (c13 * c13)));
        roll = Math.atan2(c23, c33);
    }
    else if (mag_c13 == 1)
    {
        yaw = Math.atan2(-c21, c22);
        pitch = Math.asin(-c13);
        roll = 0.0;
    }
    
    return {
        yaw: yaw * 180 / Math.PI,
        pitch: pitch * 180 / Math.PI,
        roll: roll * 180 / Math.PI
    };
}
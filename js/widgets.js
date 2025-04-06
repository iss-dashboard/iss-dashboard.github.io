const widgetContainer = document.querySelector("#widget-container");

const eventConsole = document.querySelector("#event-console");
const cabinTemperature = document.querySelector("#cabin-temperature");
const cabinPressure = document.querySelector("#cabin-pressure");
const view3D = document.querySelector("#view-3D");

for (const widget of widgetContainer.children) {
    setTitle(widget);
}

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
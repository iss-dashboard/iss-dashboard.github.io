const widgetUpdaters = {
    USLAB000058: updatePressure,
    USLAB000059: updateTemperature
}

function updateTemperature(value) {
    const label = cabinTemperature.querySelector(".label-text");
    label.innerHTML = Number(value).toFixed(2);
}

function updatePressure(value) {
    const label = cabinPressure.querySelector(".label-text");
    label.innerHTML = torrToHPa(Number(value)).toFixed(2);
}
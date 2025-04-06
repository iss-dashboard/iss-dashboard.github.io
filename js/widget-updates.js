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

function update3DView(data) {
    const latitudeInteger = Math.round(data.iss_position.latitude);
    const longitudeInteger = (Math.round(data.iss_position.longitude) + 360) % 360;

    console.log(latitudeInteger, longitudeInteger);

    const earthImagePath = `img/earth-animation/${String(longitudeInteger).padStart(4, "0")}.png`;
    view3D.querySelector("#earth-animation").setAttribute("src", earthImagePath);
}
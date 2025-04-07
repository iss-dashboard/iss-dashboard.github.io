const widgetUpdaters = {
    USLAB000058: updatePressure,
    USLAB000059: updateTemperature,
    USLAB000040: updateBetaAngle,
    USLAB000041: updateCMGLOAC,
    USLAB000042: updateISSLOAC,
    NODE3000004: updateUrineProcessorState,
    NODE3000005: updateUrineTank,
    USLAB000001: updateCMG1State,
    USLAB000002: updateCMG2State,
    USLAB000003: updateCMG3State,
    USLAB000004: updateCMG4State,
    USLAB000032: updateXState,
    USLAB000033: updateYState,
    USLAB000034: updateZState
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
    const latitude = data.iss_position.latitude;
    const longitude = data.iss_position.longitude;

    // Display longitude

    const longitudeInteger = (Math.round(longitude) + 360) % 360;

    const earthView = view3D.querySelector("#earth-animation");

    const earthImagePath = `img/earth-animation/${String(longitudeInteger).padStart(4, "0")}.png`;

    if (earthView.getAttribute("src") !== earthImagePath) {
        earthView.setAttribute("src", earthImagePath);
    }

    // Display latitude

    const pointer = view3D.querySelector("#iss-3d-pointer");

    const pointerXFloat = -Math.SQRT1_2 * Math.cos(latitude * (Math.PI / 180));
    const pointerYFloat = Math.sin(latitude * (Math.PI / 180));
    const theta = Math.atan2(pointerYFloat, -pointerXFloat);

    pointer.style.left = (pointerXFloat + 1.0) * 50 + "%";
    pointer.style.top = -pointerYFloat * 50 + "%";

    pointer.style.transform = `translate(-50%) rotate(${theta}rad)`;

    // Move ISS label

    const labelISS = view3D.querySelector("#iss-label");

    labelISS.style.left = (pointerXFloat + 1.0) * 50 - Math.cos(theta) * 20 - 9 + "%";
    labelISS.style.top = -pointerYFloat * 50 + 50 - Math.sin(theta) * 20 + "%";

    // Set labels

    const coords = convertCoords(latitude, longitude);

    view3D.querySelector("#label-latitude").innerHTML = coords.latitude;
    view3D.querySelector("#label-longitude").innerHTML = coords.longitude;
    view3D.querySelector("#latitude-ns-label").innerHTML = coords.northSouth;
    view3D.querySelector("#longitude-ew-label").innerHTML = coords.eastWest;
}

function updateBetaAngle(angle) {
    view3D.querySelector("#label-beta").innerHTML = toDMSString(angle);
}

function updateCMGLOAC(flag) {
    const label = loac.querySelector("#label-cmg-control");
    if (flag === "0") {
        label.innerHTML = "YES";
        label.setAttribute("class", "label-ok");
    } else {
        // Uh oh...
        label.innerHTML = "NO";
        label.setAttribute("class", "label-notok");
    }
}

function updateISSLOAC(flag) {
    const label = loac.querySelector("#label-iss-control");
    if (flag === "0") {
        label.innerHTML = "YES";
        label.setAttribute("class", "label-ok");
    } else {
        // Uh oh...
        label.innerHTML = "NO";
        label.setAttribute("class", "label-notok");
    }
}

function updateUrineProcessorState(flag) {
    const label = pissOMeter.querySelector("#urine-processor-state");
    label.innerHTML = {
          2: "STOP",
          4: "SHUTDOWN",
          8: "MAINTENANCE",
         16: "NORMAL",
         32: "STANDBY",
         64: "IDLE",
        128: "SYSTEM INITIALIZED"
    }[flag];
}

function updateUrineTank(percentage) {
    pissOMeter.querySelector("#urine-tank-percentage").innerHTML = percentage + "%";
    pissOMeter.querySelector("#urine-indicator").style.height = percentage + "%";
    pissOMeter.querySelector("#urine-indicator").style.top = (100 - Number(percentage)) + "%";
}

function updateCMGState(flag, cmg) {
    const label = document.querySelector(`#rotor${cmg}-enabled`); 
    label.innerHTML = ["NOT IN USE", "IN USE"][Number(flag)];
    if (flag === "0") {
        label.classList.remove("label-ok");
        label.classList.add("label-notok");
        document.querySelector(`#rotor${cmg}`).classList.remove("spinning");
    } else {
        label.classList.remove("label-notok");
        label.classList.add("label-ok");
        // document.querySelector(`#rotor${cmg}`).classList.add("spinning");
    }
}

function updateCMG1State(flag) {
    updateCMGState(flag, 1);
}

function updateCMG2State(flag) {
    updateCMGState(flag, 2);
}

function updateCMG3State(flag) {
    updateCMGState(flag, 3);
}

function updateCMG4State(flag) {
    updateCMGState(flag, 4);
}

function updateXState(x) {
    xState = Number(x);
    xUpToDate = false;
    updateAltitude();
}

function updateYState(y) {
    yState = Number(y);
    yUpToDate = false;
    updateAltitude();
}

function updateZState(z) {
    zState = Number(z);
    zUpToDate = false;
    updateAltitude();
}

function updateAltitude() {
    if (!xUpToDate && !yUpToDate && !zUpToDate) {
        [xUpToDate, yUpToDate, zUpToDate] = [true, true, true];
        altitude = (Math.sqrt(xState ** 2 + yState ** 2 + zState ** 2) - 6378) * 1000;
        
        altitudesInterval.push(altitude);
        altitudesDelays.push(Date.now() - lastAltitudeUpdate);

        lastAltitudeUpdate = Date.now();
    }
    if (t === 0) {
        updateAltitudeGraph();
    }
    altitudeGraph.querySelector("#altitude-label").innerHTML = Math.round(altitude) + " m";
}

function updateAltitudeGraph() {
    if (altitude === 0.0) {
        return;
    }
    let weighedAltitude = 0;
    let altitudesDelaysSum = altitudesDelays[0] || 0;

    if (altitudesDelays.length !== 0) { 
        // Before receiving any updates, the altitude is assumed to be equal to the first update
        weighedAltitude += altitudesInterval[0] * altitudesDelays[0];

        for (let i = 1; i < altitudesDelays.length; i++) {
            weighedAltitude += altitudesDelays[i] * altitudesInterval[i - 1];
            altitudesDelaysSum += altitudesDelays[i];
        }
    }

    // The last altitude is also interpolated
    weighedAltitude += altitude * (altitudeUpdateInterval - altitudesDelaysSum);

    altitudeChart.data.labels.splice(0, 0, t);
    altitudeChart.data.datasets[0].data.push(weighedAltitude / altitudeUpdateInterval);
    altitudeChart.update();

    altitudesInterval = [];
    altitudesDelays = [];

    t += altitudeUpdateInterval / altitudeUpdateUnit;

    if (t === SEC_TO_MIN_THRESHOLD && altitudeUpdateInterval !== 60000) {
        graphSecondsToMinutes();
        altitudeUpdateInterval = 60000;
        altitudeUpdateUnit = 60000;
        t = SEC_TO_MIN_THRESHOLD / 60;
    }

    // ISS height graph window is limited to 30 minutes
    if (altitudeChart.data.labels.length === 31) {
        altitudeChart.data.labels.shift();
        altitudeChart.data.datasets[0].data.shift();
    }
}
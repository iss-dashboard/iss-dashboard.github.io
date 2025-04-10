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
    USLAB000034: updateZState,
    CSASSRMS011: updateSSRMSPayload,
    CSASPDM0010: updateSPDM1Payload,
    CSASPDM0019: updateSPDM2Payload,

    CSASSRMS004: updateSSRMSMoving,
    CSASSRMS005: updateSSRMSMoving,
    CSASSRMS006: updateSSRMSMoving,
    CSASSRMS007: updateSSRMSMoving,
    CSASSRMS008: updateSSRMSMoving,
    CSASSRMS009: updateSSRMSMoving,
    CSASSRMS010: updateSSRMSMoving,
    
    CSASPDM0003: updateSPDM1Moving,
    CSASPDM0004: updateSPDM1Moving,
    CSASPDM0005: updateSPDM1Moving,
    CSASPDM0006: updateSPDM1Moving,
    CSASPDM0007: updateSPDM1Moving,
    CSASPDM0008: updateSPDM1Moving,
    CSASPDM0009: updateSPDM1Moving,

    CSASPDM0011: updateSPDM2Moving,
    CSASPDM0012: updateSPDM2Moving,
    CSASPDM0013: updateSPDM2Moving,
    CSASPDM0014: updateSPDM2Moving,
    CSASPDM0015: updateSPDM2Moving,
    CSASPDM0016: updateSPDM2Moving,
    CSASPDM0017: updateSPDM2Moving,

    Z1000001: updateCMG1Vibration,
    Z1000002: updateCMG2Vibration,
    Z1000003: updateCMG3Vibration,
    Z1000004: updateCMG4Vibration,
    Z1000005: updateCMG1Current,
    Z1000006: updateCMG2Current,
    Z1000007: updateCMG3Current,
    Z1000008: updateCMG4Current,
    Z1000009: updateCMG1Speed,
    Z1000010: updateCMG2Speed,
    Z1000011: updateCMG3Speed,
    Z1000012: updateCMG4Speed,

    USLAB000012: updateGNC,
    USLAB000081: updateAttitudeManeuver,

    USLAB000YAW: updateYaw,
    USLAB000PIT: updatePitch,
    USLAB000ROL: updateRoll,

    AIRLOCK000050: updateHiPressureO2Valve,
    AIRLOCK000051: updateLoPressureO2Valve,
    AIRLOCK000052: updateN2Valve,

    NODE3000006: updateWaterProcessorState,
    NODE3000007: updateWaterProcessorStep,
    NODE3000008: updateWasteWater,
    NODE3000009: updateCleanWater,

    Z1000013: updateKuBand,
    USLAB000087: updateConnectedLaptops,

    NODE3000010: updateOxygenGenerator,
    NODE3000011: updateO2Production,

    S1000006: updateStarSTR,
    P1000008: updatePortSTR,
    S0000008: updatePortSARJMode,
    S0000004: updatePortSARJAngle,
    S0000009: updateStarSARJMode,
    S0000003: updateStarSARJAngle,


    USLAB000039: updateISSMass,
    USLAB000086: updateISSMode,

    USLAB000018: updateLVLHQ0,
    USLAB000019: updateLVLHQ1,
    USLAB000020: updateLVLHQ2,
    USLAB000021: updateLVLHQ3,

    P4000003: updateSolarArray2A,
    P4000006: updateSolarArray4A,
    P6000003: updateSolarArray4B,
    P6000006: updateSolarArray2B,

    S4000003: updateSolarArray1A,
    S4000006: updateSolarArray3A,
    S6000003: updateSolarArray3B,
    S6000006: updateSolarArray1B,

    AIRLOCK000049: updateCrewlockPressure,
    AIRLOCK000054: updateEquipmentLockPressure
}

function updateTemperature(value) {
    const label = cabinTemperature.querySelector(".label-text");
    label.innerHTML = Number(value).toFixed(1);
}

function updatePressure(value) {
    const label = cabinPressure.querySelector(".label-text");
    const dialHand = cabinPressure.querySelector("#dial-hand");

    const pressure = torrToHPa(Number(value));

    label.innerHTML = pressure.toFixed(2);

    if (pressure >= 985) {
        label.classList.remove("label-notok");
        label.classList.remove("label-neutral");
        label.classList.add("label-ok");
    } else if (pressure < 985 && pressure >= 965) {
        label.classList.remove("label-notok");
        label.classList.add("label-neutral");
        label.classList.remove("label-ok");
    } else {
        label.classList.add("label-notok");
        label.classList.remove("label-neutral");
        label.classList.remove("label-ok");
    }

    const pressureDelta = SEA_LEVEL_AIR_PRESSURE - pressure;

    dialHand.style.transform = `translate(-50%) rotate(${-pressureDelta / 100 * 30}deg)`;
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
        document.querySelector(`#rotor${cmg}`).classList.add("spinning");
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
    let weighedAltitude = 0.0;
    let altitudesDelaysSum = altitudesDelays[0] || 0.0;

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
    altitudeChart.data.datasets[0].data.push(Math.round(weighedAltitude / altitudeUpdateInterval));
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
        altitudeChart.update();
    }
}

function updateSSRMSPayload(flag) {
    robotics.querySelector("#SSRMS-payload").innerHTML = {
        0:"Released", 1:"Captive", 2:"Captured"
    }[Number(flag)];
}

function updateSPDM1Payload(flag) {
    robotics.querySelector("#SPDM1-payload").innerHTML = {
        0:"Released", 1:"Captive", 2:"Captured"
    }[Number(flag)];
}

function updateSPDM2Payload(flag) {
    robotics.querySelector("#SPDM2-payload").innerHTML = {
        0:"Released", 1:"Captive", 2:"Captured"
    }[Number(flag)];
}

function updateSSRMSMoving() {
    lastSSRMSMovementUpdate = Date.now();
    setTimeout(stillMovingSSRMS, 5000);
}

function stillMovingSSRMS() {
    const label = robotics.querySelector("#SSRMS-status"); 
    if (Date.now() - lastSSRMSMovementUpdate > 4900) {
        label.innerHTML = "Idle";
        label.classList.remove("label-ok");
        label.classList.add("label-neutral");
    } else {
        label.innerHTML = "Moving";
        label.classList.remove("label-neutral");
        label.classList.add("label-ok");
    }
    setTimeout(stillMovingSSRMS, 5000)
}

function updateSPDM1Moving() {
    lastSPDM1MovementUpdate = Date.now();
    setTimeout(stillMovingSPDM1, 5000);
}

function stillMovingSPDM1() {
    const label = robotics.querySelector("#SPDM1-status"); 
    if (Date.now() - lastSPDM1MovementUpdate > 4900) {
        label.innerHTML = "Idle";
        label.classList.remove("label-ok");
        label.classList.add("label-neutral");
    } else {
        label.innerHTML = "Moving";
        label.classList.remove("label-neutral");
        label.classList.add("label-ok");
    }
    setTimeout(stillMovingSPDM1, 5000)
}

function updateSPDM2Moving() {
    lastSPDM2MovementUpdate = Date.now();
    setTimeout(stillMovingSPDM2, 5000);
}

function stillMovingSPDM2() {
    const label = robotics.querySelector("#SPDM2-status"); 
    if (Date.now() - lastSSRMSMovementUpdate > 4900) {
        label.innerHTML = "Idle";
        label.classList.remove("label-ok");
        label.classList.add("label-neutral");
    } else {
        label.innerHTML = "Moving";
        label.classList.remove("label-neutral");
        label.classList.add("label-ok");
    }
    setTimeout(stillMovingSPDM2, 5000)
}

function updateCMGVibration(vibration, cmg) {
    document.querySelector(`#cmg${cmg}-vibration`).innerHTML = Number(vibration).toFixed(5);
}

function updateCMGCurrent(amps, cmg) {
    document.querySelector(`#cmg${cmg}-current`).innerHTML = Number(amps).toFixed(3);
}

function updateCMGSpeed(rpm, cmg) {
    document.querySelector(`#cmg${cmg}-rpm`).innerHTML = rpm;
}

function updateCMG1Vibration(vibration) { updateCMGVibration(vibration, 1); }
function updateCMG2Vibration(vibration) { updateCMGVibration(vibration, 2); }
function updateCMG3Vibration(vibration) { updateCMGVibration(vibration, 3); }
function updateCMG4Vibration(vibration) { updateCMGVibration(vibration, 4); }

function updateCMG1Current(vibration) { updateCMGCurrent(vibration, 1); }
function updateCMG2Current(vibration) { updateCMGCurrent(vibration, 2); }
function updateCMG3Current(vibration) { updateCMGCurrent(vibration, 3); }
function updateCMG4Current(vibration) { updateCMGCurrent(vibration, 4); }

function updateCMG1Speed(vibration) { updateCMGSpeed(vibration, 1); }
function updateCMG2Speed(vibration) { updateCMGSpeed(vibration, 2); }
function updateCMG3Speed(vibration) { updateCMGSpeed(vibration, 3); }
function updateCMG4Speed(vibration) { updateCMGSpeed(vibration, 4); }

function updateVariousValue(elemId, val) {
    various.querySelector("#var-" + elemId).innerHTML = val;
}

function updateGNC(flag) {
    document.querySelector("#gnc-mode").innerHTML = {0:"Default",1:"WAIT",2:"RESERVED",3:"STANDBY",4:"CMG ATTITUDE CONTROL",5:"CMG/THRUSTER ASSIST ATTITUDE CONTROL",6:"USER DATA GENERATION",7:"FREEDRIFT"}[Number(flag)];
}

function updateAttitudeManeuver(flag) {
    updateVariousValue("maneuver",
        {0:"FALSE",1:"TRUE"}[Number(flag)]
    );
}

function updateYaw(angle) {
    console.log("yaw", angle);
    updateVariousValue("yaw", angle + "°");
    
}

function updatePitch(angle) {
    updateVariousValue("pitch", angle + "°");
}

function updateRoll(angle) {
    updateVariousValue("roll", angle + "°");
}

function updateHiPressureO2Valve(flag) {
    updateVariousValue("o2-hi",
        {0:"CLOSED",1:"OPEN",2:"IN-TRANSIT",3:"FAILED"}[flag]
    );
}

function updateLoPressureO2Valve(flag) {
    updateVariousValue("o2-lo",
        {0:"CLOSED",1:"OPEN",2:"IN-TRANSIT",3:"FAILED"}[flag]
    );
}

function updateN2Valve(flag) {
    updateVariousValue("n2",
        {0:"CLOSED",1:"OPEN",2:"IN-TRANSIT",3:"FAILED"}[flag]
    );
}

function updateWaterProcessorState(flag) {
    updateVariousValue("h2o-proc-state",
        {1:"STOP",2:"SHUTDOWN",3:"STANDBY",4:"PROCESS",5:"HOT SERVICE",6:"FLUSH",7:"WARM SHUTDOWN"}[flag]
    );
}

function updateWaterProcessorStep(flag) {
    updateVariousValue("h2o-proc-step",
        {0:"NONE",1:"VENT",2:"HEATUP",3:"PURGE",4:"FLOW",5:"TEST",6:"TEST_SV_1",7:"TEST_SV_2",8:"SERVICE"}[flag]
    );
}

function updateWasteWater(percentage) {
    updateVariousValue("waste-water", Number(percentage).toFixed(1) + "%");
}

function updateCleanWater(percentage) {
    updateVariousValue("clean-water", Number(percentage).toFixed(1) + "%");
}

function updateKuBand(flag) {
    updateVariousValue("ku-band",
        {0:"RESET",1:"NORMAL"}[flag]
    );
}

function updateConnectedLaptops(count) {
    updateVariousValue("laptops", count);
}

function updateOxygenGenerator(flag) {
    updateVariousValue("o2-gen",
        {1:"PROCESS",2:"STANDBY",3:"SHUTDOWN",4:"STOP",5:"VENT_DOME",6:"INERT_DOME",7:"FAST_SHUTDOWN",8:"N2_PURGE_SHUTDOWN"}[flag]
    );
}

function updateO2Production(value) {
    updateVariousValue("o2-production", (Number(value) * 0.45359).toFixed(1) + " kg/day");
}

function updateStarSTR(flag) {
    updateVariousValue("s-radiator",
        {0:"OFF",1:"ON", 2:"FAILED", 3:"FAILED"}[flag]
    );
}

function updatePortSTR(flag) {
    updateVariousValue("p-radiator",
        {0:"OFF",1:"ON", 2:"FAILED", 3:"FAILED"}[flag]
    );
}

function updatePortSARJMode(flag) {
    updateVariousValue("psarj-mode",
        {1:"STANDBY",2:"RESTART",3:"CHECKOUT",4:"DIRECTED_POSITION",5:"AUTOTRACK",6:"BLIND",7:"SHUTDOWN",8:"SWITCHOVER"}[flag]
    );
}

function updatePortSARJAngle(angle) {
    updateVariousValue("psarj-angle", Number(angle).toFixed(2) + "°");
}

function updateStarSARJMode(flag) {
    updateVariousValue("ssarj-mode",
        {1:"STANDBY",2:"RESTART",3:"CHECKOUT",4:"DIRECTED_POSITION",5:"AUTOTRACK",6:"BLIND",7:"SHUTDOWN",8:"SWITCHOVER"}[flag]
    );
}

function updateStarSARJAngle(angle) {
    updateVariousValue("ssarj-angle", Number(angle).toFixed(2) + "°");
}

function updateISSMass(mass) {
    updateVariousValue("iss-mass", Number(mass).toFixed(0) + " kg");
}

function updateISSMode(flag) {
    updateVariousValue("iss-mode",
        {1:"Standard",2:"Microgravity",4:"Reboost",8:"Proximity_Ops",16:"External_Ops",32:"Survival",64:"ASCR",127:"all_modes"}[flag]
    )
}

function updateLVLHQ0(value) {
    q0 = Number(value);
    updateYawPitchRoll();
}

function updateLVLHQ1(value) {
    q1 = Number(value);
    updateYawPitchRoll();
}

function updateLVLHQ2(value) {
    q2 = Number(value);
    updateYawPitchRoll();
}

function updateLVLHQ3(value) {
    q3 = Number(value);
    updateYawPitchRoll();
}

function updateYawPitchRoll() {
    if (q0 !== undefined && q1 !== undefined && q2 !== undefined && q3 !== undefined) {
        const orientation = toYawPitchRoll(q0, q1, q2, q3);
        updateVariousValue("yaw", orientation.yaw.toFixed(3) + "°");
        updateVariousValue("pitch", orientation.pitch.toFixed(3) + "°");
        updateVariousValue("roll", orientation.roll.toFixed(3) + "°");
    }
}

function updateSolarArray(flag, solarArray) {
    const elementSelector = "#solar-" + solarArray;
    const element = (document.querySelector(elementSelector)
        || document.querySelector("#iss-solar").getSVGDocument().querySelector(elementSelector));
    element.setAttribute("fill", {0: "red", 1: "#0f0"}[flag]);
}

function updateSolarArray1A(flag) {
    updateSolarArray(flag, "1a");
}

function updateSolarArray1B(flag) {
    updateSolarArray(flag, "1b");
}

function updateSolarArray2A(flag) {
    updateSolarArray(flag, "2a");
}

function updateSolarArray2B(flag) {
    updateSolarArray(flag, "2b");
}

function updateSolarArray3A(flag) {
    updateSolarArray(flag, "3a");
}

function updateSolarArray3B(flag) {
    updateSolarArray(flag, "3b");
}

function updateSolarArray4A(flag) {
    updateSolarArray(flag, "4a");
}

function updateSolarArray4B(flag) {
    updateSolarArray(flag, "4b");
}

function updateCrewlockPressure(pressure) {
    const element = (document.querySelector("#crewlock-pressure")
        || document.querySelector("#iss-airlock").getSVGDocument().querySelector("#crewlock-pressure"));
    element.innerHTML = torrToHPa(Number(pressure)).toFixed(1) + " hPa";
}

function updateEquipmentLockPressure(pressure) {
    const element = (document.querySelector("#equipment-lock-pressure")
        || document.querySelector("#iss-airlock").getSVGDocument().querySelector("#equipment-lock-pressure"));
    element.innerHTML = torrToHPa(Number(pressure)).toFixed(1) + " hPa";
}
let altitudeUpdateInterval = 10000;
let altitudeUpdateUnit = 1000;

const SEC_TO_MIN_THRESHOLD = 180;

require(["LightstreamerClient","Subscription"],function(LightstreamerClient,Subscription) 
{
	const client = new LightstreamerClient("https://push.lightstreamer.com","ISSLIVE");
	client.connect();
 
	const sub = new Subscription("MERGE", SUBSCRIPTIONS, ["Value","TimeStamp"]);
    const timeSub = new Subscription("MERGE", "TIME_000001", ["TimeStamp","Status.Class"]);

    client.subscribe(sub);

    sub.addListener({onItemUpdate: updateTelemetry});
});

function trackISS() {
    fetch("http://api.open-notify.org/iss-now.json").then(function(response) {
        return response.json();
    }).then(function(data) {
        update3DView(data);
    }).catch(() => {});

    setTimeout(trackISS, 1000);  // Every second
}

function trackAltitude() {
    updateAltitudeGraph();
    setTimeout(trackAltitude, altitudeUpdateInterval);  // Every 10 seconds
}

trackISS();
trackAltitude();


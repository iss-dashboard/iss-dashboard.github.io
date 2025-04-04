require(["LightstreamerClient","Subscription"],function(LightstreamerClient,Subscription) 
{
	const client = new LightstreamerClient("https://push.lightstreamer.com","ISSLIVE");
	client.connect();
 
	const sub = new Subscription("MERGE", SUBSCRIPTIONS, ["Value","TimeStamp"]);
    const timeSub = new Subscription("MERGE", "TIME_000001", ["TimeStamp","Status.Class"]);

    client.subscribe(sub);

    sub.addListener({onItemUpdate: updateTelemetry});
});


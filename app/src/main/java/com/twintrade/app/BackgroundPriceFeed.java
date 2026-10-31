package com.twintrade.app;

import java.net.URI;
import java.util.function.Consumer;
import java.util.function.LongSupplier;
import java.util.function.ToIntFunction;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

/** Native background transport. All deadlines use elapsed time, never the device wall clock. */
public final class BackgroundPriceFeed {
 public interface Events { void open(); void message(String raw); void failed(); }
 public interface Transport { void connect(); void close(); }
 public interface Factory { Transport create(Events events) throws Exception; }
 private final LongSupplier clock;
 private final Factory factory;
 private final ToIntFunction<String> ingest;
 private final Consumer<String> status;
 private final Runnable connected;
 private Transport socket;
 private long generation=0,attemptAt=0,healthyAt=0,nextAttempt=0;
 private int failures=0;
 private boolean stopped=false,attempted=false;

 public BackgroundPriceFeed(Runnable connected,LongSupplier elapsedTime) {
  this(elapsedTime,events->{
   WebSocketClient client=new WebSocketClient(new URI("wss://backend-pricing.eu.gains.trade/v4")) {
    public void onOpen(ServerHandshake handshake){events.open();}
    public void onMessage(String raw){events.message(raw);}
    public void onClose(int code,String reason,boolean remote){events.failed();}
    public void onError(Exception error){events.failed();}
   };
   client.setConnectionLostTimeout(15);
   return new Transport(){public void connect(){client.connect();}public void close(){client.closeConnection(1000,"Monitor reconnect/stop");}};
  },raw->PriceFeed.ingest(raw,System.currentTimeMillis()),s->MarketStore.status=s,connected);
 }
 public BackgroundPriceFeed(LongSupplier clock,Factory factory,ToIntFunction<String> ingest,Consumer<String> status,Runnable connected) {
  this.clock=clock;this.factory=factory;this.ingest=ingest;this.status=status;this.connected=connected;
 }
 /** Called by one fixed-delay watchdog; connection callbacks never fork retry jobs. */
 public synchronized void poll() {
  if(stopped)return;
  long now=clock.getAsLong();
  if(socket!=null&&now-healthyAt>=20000)fail(generation);
  if(socket==null&&(!attempted||now>=nextAttempt))connect(now);
 }
 public synchronized void reconnect() {
  if(stopped)return;
  long now=clock.getAsLong();
  if(attempted&&now-attemptAt<1000)return;
  detach();nextAttempt=now;connect(now);
 }
 private void connect(long now) {
  attempted=true;attemptAt=healthyAt=now;
  final long owner=++generation;
  status.accept("Connecting · background active");
  try {
   socket=factory.create(new Events(){
    public void open(){synchronized(BackgroundPriceFeed.this){if(!owns(owner))return;status.accept("Connected · waiting for fresh prices");connected.run();}}
    public void message(String raw){synchronized(BackgroundPriceFeed.this){if(!owns(owner))return;
     // Heartbeats, malformed frames and stale server timestamps cannot hide a stalled feed.
     if(ingest.applyAsInt(raw)>0){healthyAt=clock.getAsLong();failures=0;status.accept("Connected · background active");}
    }}
    public void failed(){synchronized(BackgroundPriceFeed.this){fail(owner);}}
   });
   socket.connect();
  }catch(Exception error){fail(owner);}
 }
 private boolean owns(long owner){return !stopped&&generation==owner;}
 private void fail(long owner) {
  if(!owns(owner))return;
  detach();nextAttempt=clock.getAsLong()+Math.min(30000,1000L<<Math.min(failures++,5));
  status.accept("Disconnected · automatic background retry");
 }
 private void detach() {
  // Invalidate callbacks before closing: some transports invoke onClose synchronously.
  ++generation;Transport old=socket;socket=null;
  if(old!=null)try{old.close();}catch(RuntimeException ignored){}
 }
 public synchronized void close(){if(stopped)return;stopped=true;detach();}
}

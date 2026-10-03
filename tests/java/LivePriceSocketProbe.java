import com.twintrade.app.*;import org.json.*;import org.java_websocket.client.WebSocketClient;import org.java_websocket.handshake.ServerHandshake;import java.net.URI;import java.util.concurrent.*;import java.util.concurrent.atomic.*;
/** Read-only integration probe: never loads wallets or submits transactions. */
public class LivePriceSocketProbe {
 public static void main(String[] args)throws Exception{
  MarketStore.init(new android.content.Context());CountDownLatch live=new CountDownLatch(1);AtomicInteger accepted=new AtomicInteger(),objects=new AtomicInteger(),arrays=new AtomicInteger();
  WebSocketClient s=new WebSocketClient(new URI("wss://backend-pricing.eu.gains.trade/v4")){
   public void onOpen(ServerHandshake h){System.out.println("Gains v4 websocket handshake connected");}
   public void onMessage(String raw){if(raw.trim().startsWith("{"))objects.incrementAndGet();else arrays.incrementAndGet();accepted.addAndGet(PriceFeed.ingest(raw,System.currentTimeMillis()));if(MarketStore.priceOf(0)>0&&System.currentTimeMillis()-MarketStore.timeOf(0)<5000)live.countDown();}
   public void onClose(int c,String r,boolean remote){System.out.println("Socket closed: "+c);}
   public void onError(Exception e){System.out.println("Socket error: "+e.getClass().getSimpleName());}
  };
  try{s.connect();if(!live.await(30,TimeUnit.SECONDS))throw new AssertionError("No live BTC price accepted from Gains within 30s");JSONObject snap=new JSONObject(MarketStore.snapshot());System.out.println("LIVE PROBE PASS: BTC="+MarketStore.priceOf(0)+" acceptedPrices="+accepted.get()+" objectFrames="+objects.get()+" arrayFrames="+arrays.get()+" indexBTC="+snap.getJSONObject("indexPrices").optDouble("0",Double.NaN));}finally{s.closeBlocking();}
 }
}

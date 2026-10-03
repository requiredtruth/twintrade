import com.twintrade.app.*;import org.json.*;
public class PriceFeedTest {
 static void check(boolean b,String msg){if(!b)throw new AssertionError(msg);}
 public static void main(String[] args)throws Exception{MarketStore.init(new android.content.Context());MarketStore.reset();long now=System.currentTimeMillis();
  check(PriceFeed.ingest("[0,100,1,20]",now)==2,"legacy price frames");check(MarketStore.priceOf(0)==100,"native quote updated");
  check(PriceFeed.ingest("["+now+"]",now)==0,"heartbeat is not a price");
  check(PriceFeed.ingest("{\"m\":[0,101],\"i\":[0,99],\"t\":"+now+"}",now)==2,"mark/index frame");JSONObject snap=new JSONObject(MarketStore.snapshot());check(snap.getJSONObject("indexPrices").getDouble("0")==99,"real index saved");
  check(PriceFeed.ingest("{broken",now)==0,"malformed JSON rejected");
  check(PriceFeed.ingest("[2,null,1,21,2.5,9,0,102]",now)==2,"bad pair cannot suppress later valid prices");check(MarketStore.priceOf(0)==102,"continued parsing");
  check(PriceFeed.ingest("{\"m\":[0,500],\"t\":"+(now-5000)+"}",now)==0,"stale frame");check(PriceFeed.ingest("{\"m\":[0,500],\"t\":"+(now+1)+"}",now)==0,"future frame");check(MarketStore.priceOf(0)==102,"invalid timestamps cannot replace quote");
  String costs="{\"fee\":0,\"slip\":0,\"borrow\":0,\"funding\":0,\"liq\":90}";check(MarketStore.open(0,true,10,10,costs).equals("OK"),"foreground recovery quote enables native paper order");PriceFeed.ingest("[0,80]",System.currentTimeMillis());check(new JSONObject(MarketStore.book()).getJSONArray("positions").length()==0,"recovery ticks settle native liquidation");
  System.out.println("PASS: real native frame ingestion, independent mark/index, heartbeats, mixed invalid pairs, stale/future timestamps and recovery-ledger liquidation.");
 }
}

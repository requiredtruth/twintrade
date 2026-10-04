import com.twintrade.app.MarketStore;import org.json.*;
public class PerformanceTest {
 static void check(boolean b,String why){if(!b)throw new AssertionError(why);}
 public static void main(String[] args)throws Exception {
  MarketStore.init(new android.content.Context());MarketStore.seed("{\"cash\":100,\"positions\":[],\"history\":[]}");
  long now=System.currentTimeMillis(),minute=now/60000*60000;
  for(int pair=0;pair<40;pair++){JSONArray a=new JSONArray();for(int j=100;j>=1;j--)a.put(new JSONObject().put("t",minute-j*60000).put("o",100).put("h",101).put("l",99).put("c",100).put("source","gains-history"));MarketStore.merge(pair,a);MarketStore.tick(pair,100,now);}
  JSONObject initial=new JSONObject(MarketStore.snapshotFor(0,-1));long revision=initial.getLong("candleRevision");check(initial.getJSONObject("selectedCandles").getJSONArray("0").length()==101,"Initial selected history lost");
  MarketStore.tick(0,101,System.currentTimeMillis());String delta=MarketStore.snapshotFor(0,revision),full=MarketStore.snapshot();JSONObject d=new JSONObject(delta);
  check(d.getJSONObject("selectedCandles").getJSONArray("0").length()==1,"Unchanged revision must send tail only");check(d.getJSONObject("selectedCandles").getJSONArray("0").getJSONObject(0).getDouble("c")==101,"Tail update lost");check(d.getJSONObject("pricesByPair").length()==38,"Inactive-market quotes lost");check(d.getJSONObject("candlesByPair").length()==0,"Unselected histories serialized");check(delta.length()<full.length()/10,"Bridge payload reduction absent");
  check(new JSONObject(MarketStore.snapshotFor(20,-1)).getJSONObject("selectedCandles").getJSONArray("20").length()==101,"Switch market failed");
  MarketStore.merge(0,new JSONArray().put(new JSONObject().put("t",minute-60000).put("o",110).put("h",111).put("l",109).put("c",110).put("source","gains-history")));
  check(new JSONObject(MarketStore.snapshotFor(0,revision)).getJSONObject("selectedCandles").getJSONArray("0").length()==101,"Backfill invalidation failed");
  String old=MarketStore.book();MarketStore.open(0,true,10,1,"{\"fee\":0,\"slip\":0,\"borrow\":0,\"funding\":0,\"liq\":90}");check(!MarketStore.book().equals(old),"Ledger cache stale after open");MarketStore.reset();check(new JSONObject(MarketStore.book()).getDouble("cash")==100,"Ledger cache stale after reset");
  System.out.println("PASS: selected history, revision deltas/backfill, market switching, all quotes and ledger freshness. Bridge bytes "+full.length()+" -> "+delta.length()+" (40 markets × 101 candles).");
 }
}

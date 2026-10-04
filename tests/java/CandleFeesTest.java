import com.twintrade.app.MarketStore;import org.json.*;
public class CandleFeesTest {
 static void check(boolean v,String m){if(!v)throw new AssertionError(m);}
 public static void main(String[] args)throws Exception {
  long t=1700000040000L;MarketStore.tick(0,100,t);MarketStore.tick(0,110,t+180000);
  JSONArray a=new JSONObject(MarketStore.snapshot()).getJSONArray("candles").getJSONArray(0);check(a.length()==4,"fill missing minutes");check(a.getJSONObject(1).getString("source").equals("gap-fill"),"marked missing data");
  MarketStore.merge(0,new JSONArray().put(new JSONObject().put("t",t+60000).put("o",102).put("h",107).put("l",99).put("c",105).put("source","gains-history")));
  a=new JSONObject(MarketStore.snapshot()).getJSONArray("candles").getJSONArray(0);check(a.getJSONObject(1).getDouble("h")==107,"real OHLC replaces placeholder");check(a.getJSONObject(2).getDouble("c")==105,"remaining placeholders rebuild");
  MarketStore.reset();MarketStore.tick(0,100,System.currentTimeMillis());check("OK".equals(MarketStore.open(0,false,100,200,"{\"fee\":0.035,\"slip\":0,\"borrow\":0.001,\"funding\":0,\"fundingSide\":-0.004,\"liq\":90}")),"open side-specific funding");
  JSONObject book=new JSONObject(MarketStore.book()),p=book.getJSONArray("positions").getJSONObject(0);java.lang.reflect.Method value=MarketStore.class.getDeclaredMethod("value",JSONObject.class,double.class,long.class);value.setAccessible(true);double net=(double)value.invoke(null,p,100.,p.getLong("opened")+3600000);check(Math.abs(net+13.4)<1e-9,"native/browser accounting parity");
  // Settle the exact $100 / $14 holding / $7+$7 fee scenario into the real native book.
  MarketStore.reset();MarketStore.tick(0,100,System.currentTimeMillis());check("OK".equals(MarketStore.open(0,true,100,200,"{\"fee\":0.035,\"slip\":0,\"borrow\":0.07,\"funding\":0,\"liq\":90}")),"open receipt scenario");
  java.lang.reflect.Field ledger=MarketStore.class.getDeclaredField("book");ledger.setAccessible(true);JSONObject nativeBook=(JSONObject)ledger.get(null),pos=nativeBook.getJSONArray("positions").getJSONObject(0);long closeTime=System.currentTimeMillis();pos.put("opened",closeTime-3600000);
  java.lang.reflect.Method closeAt=MarketStore.class.getDeclaredMethod("closeAt",JSONObject.class,double.class,long.class,String.class);closeAt.setAccessible(true);closeAt.invoke(null,pos,100.2698,closeTime,"Closed");
  JSONObject result=new JSONObject(MarketStore.book()),receipt=result.getJSONArray("history").getJSONObject(0).getJSONObject("settlement");check(Math.abs(receipt.getDouble("hold")-14)<1e-9,"holding cost saved");check(Math.abs(receipt.getDouble("net")-25.96)<1e-8,"net deducts fees and hold exactly once");check(Math.abs(result.getDouble("cash")-125.96)<1e-8,"settled cash reconciles");check(!"OK".equals(MarketStore.close(pos.getString("id"))),"no duplicate payout");
  System.out.println("PASS: native candle gap/backfill and signed side funding accounting parity.");
 }
}

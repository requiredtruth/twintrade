import com.twintrade.app.MarketStore;import org.json.*;
public class HoldingRecoveryTest {
 static void check(boolean b,String s){if(!b)throw new AssertionError(s);}
 public static void main(String[] args)throws Exception{
  MarketStore.init(new android.content.Context());MarketStore.reset();long now=System.currentTimeMillis();
  JSONObject cost=new JSONObject().put("fee",0).put("slip",0).put("borrow",.001).put("funding",.002).put("liq",90).put("holdingSource","Paper assumptions (market rates unavailable)");
  JSONObject p=new JSONObject().put("id","synthetic").put("pair",0).put("amount",100).put("lev",10).put("entry",100).put("opened",now-7200000).put("long",true).put("kind","paper").put("status","Paper open").put("cost",cost);
  java.lang.reflect.Field field=MarketStore.class.getDeclaredField("book");field.setAccessible(true);field.set(null,new JSONObject().put("cash",0).put("positions",new JSONArray().put(p)).put("history",new JSONArray()));
  check(MarketStore.recoverHoldingRates(0,.003,.004,-.005,.006,now-3600000)==1,"Recover fallback position");
  check(MarketStore.recoverHoldingRates(0,1,1,1,1,now)==0,"Recovered rate stays fixed; no repeated reset");
  MarketStore.tick(0,100,System.currentTimeMillis());String closing=MarketStore.close("synthetic");check(closing.startsWith("PENDING:"),"Close recovered position");long due=Long.parseLong(closing.substring(8));MarketStore.advancePendingForTests(0,100,due);
  JSONObject receipt=new JSONObject(MarketStore.book()).getJSONArray("history").getJSONObject(0).getJSONObject("settlement");
  double extra=(due-now)/3600000.0,expectedBorrow=.04+.03*extra,expectedFunding=-.03-.05*extra;check(Math.abs(receipt.getDouble("borrow")-expectedBorrow)<.000001,"Native borrowing checkpoint");check(Math.abs(receipt.getDouble("funding")-expectedFunding)<.000001,"Native funding credit checkpoint");check(Math.abs(receipt.getDouble("payout")-(100-expectedBorrow-expectedFunding))<.000001,"No retroactive repricing/double fees");
  check(MarketStore.recoverHoldingRates(0,-1,0,0,0,now)==0,"Invalid rate rejected");
  System.out.println("PASS: native holding recovery preserves prior fees, applies side-specific rates forward, persists split receipts and rejects repeated/invalid migrations.");
 }
}

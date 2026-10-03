import com.twintrade.app.MarketStore;import org.json.*;
public class NativeReliabilityTest {
 static void check(boolean b,String why){if(!b)throw new AssertionError(why);}
 public static void main(String[] args)throws Exception {
  MarketStore.init(new android.content.Context());MarketStore.reset();long now=System.currentTimeMillis();
  String good="{\"fee\":0,\"slip\":0,\"borrow\":0,\"funding\":0,\"liq\":90}";
  MarketStore.updateCaps("[{\"pairIndex\":300,\"maxLeverage\":500},{\"pairIndex\":33,\"maxLeverage\":150}]");
  MarketStore.tick(300,100,now);check("OK".equals(MarketStore.open(300,true,10,10,good)),"DEGEN paper open");
  String id=new JSONObject(MarketStore.book()).getJSONArray("positions").getJSONObject(0).getString("id");
  check("OK".equals(MarketStore.close(id)),"DEGEN close");double cash=new JSONObject(MarketStore.book()).getDouble("cash");check(!"OK".equals(MarketStore.close(id)),"Duplicate close rejected");check(cash==new JSONObject(MarketStore.book()).getDouble("cash"),"No double credit");
  MarketStore.tick(33,20,System.currentTimeMillis());check(!"OK".equals(MarketStore.open(33,true,10,151,good)),"Per-market leverage cap");
  check(!"OK".equals(MarketStore.open(33,true,10,10,good.replace("\"fee\":0","\"fee\":-1"))),"Negative fee rejected");
  MarketStore.tick(33,99,now-10000);check(MarketStore.priceOf(33)==20,"Out-of-order tick ignored");
  MarketStore.tick(33,99,System.currentTimeMillis()+60000);check(MarketStore.priceOf(33)==20,"Future quote ignored");MarketStore.tick(19,99,System.currentTimeMillis()-6000);check(!"OK".equals(MarketStore.open(19,true,10,10,good)),"Stale quote is not fresh");
  MarketStore.merge(33,new JSONArray("[{\"t\":60000,\"o\":5,\"h\":2,\"l\":1,\"c\":4}]"));
  JSONArray candles=new JSONObject(MarketStore.snapshot()).getJSONObject("candlesByPair").getJSONArray("33");
  for(int i=0;i<candles.length();i++)check(candles.getJSONObject(i).getLong("t")!=60000,"Invalid candle rejected");
  System.out.println("PASS: native DEGEN open/close, duplicate settlement, dynamic leverage, cost validation, delayed/future quotes and invalid candles.");
 }
}

import com.twintrade.app.BackgroundTrades;import java.util.*;import org.json.*;
public class BackgroundTradesTest {
 public static void main(String[] args)throws Exception{List<JSONObject> events=new ArrayList<>();BackgroundTrades feed=new BackgroundTrades(events::add,()->1000);
  feed.accept("{\"name\":\"tradingVariables\",\"value\":{}}","POLYGON");if(!events.isEmpty())throw new AssertionError("Snapshot replay must stay quiet");
  String trade="{\"user\":\"fixture\",\"index\":7,\"pairIndex\":300,\"long\":false}";
  String opened="{\"name\":\"liveEvent\",\"value\":{\"event\":\"MarketExecuted\",\"returnValues\":{\"t\":"+trade+",\"open\":true}}}";
  feed.accept(opened,"POLYGON");feed.accept(opened,"POLYGON");if(events.size()!=1||events.get(0).getBoolean("long"))throw new AssertionError("Live open/deduplication");
  feed.accept("{\"name\":\"liveEvents\",\"value\":[{\"event\":\"LimitExecuted\",\"args\":{\"t\":"+trade+",\"orderType\":6}}]}","POLYGON");if(events.size()!=2||!events.get(1).getString("action").equals("liq"))throw new AssertionError("Authoritative liquidation");
  feed.accept("{\"name\":\"new-trade-history\",\"action\":\"TradeClosedLIQ\",\"address\":\"fixture\",\"tradeIndex\":7,\"pair\":\"BTCDEGEN/USD\",\"long\":0}","POLYGON");if(events.size()!=2)throw new AssertionError("History duplicate replayed");
  feed.accept(opened,"BASE");if(events.size()!=3)throw new AssertionError("Independent network event identity");feed.close();
  System.out.println("PASS: native public execution envelopes, numeric IDs, LIQ classification, history deduplication, snapshot silence and per-network identities.");
 }
}

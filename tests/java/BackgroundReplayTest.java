import com.twintrade.app.*;import org.json.*;import java.util.*;
public class BackgroundReplayTest {
 static void check(boolean ok,String message){if(!ok)throw new AssertionError(message);}
 public static void main(String[] args)throws Exception {MarketStore.init(new android.content.Context());long minute=System.currentTimeMillis()/60000*60000;
  JSONArray replay=new JSONArray();for(int i=4;i>=1;i--)replay.put(new JSONObject().put("t",minute-i*60000).put("o",100+i).put("h",102+i).put("l",99+i).put("c",101+i).put("source","gains-history"));
  MarketStore.merge(77,replay);JSONObject first=new JSONObject(MarketStore.snapshotFor(77,-1));long revision=first.getLong("candleRevision");JSONArray bars=first.getJSONObject("selectedCandles").getJSONArray("77");check(bars.length()==4,"Out-of-order replay collapsed distinct minute buckets");for(int i=1;i<bars.length();i++)check(bars.getJSONObject(i).getLong("t")>bars.getJSONObject(i-1).getLong("t"),"Replay is not chronological");
  MarketStore.merge(77,new JSONArray(replay.toString()));JSONObject unchanged=new JSONObject(MarketStore.snapshotFor(77,revision));check(unchanged.getLong("candleRevision")==revision,"Identical replay advanced revision");check(unchanged.getJSONObject("selectedCandles").getJSONArray("77").length()==1,"Identical replay forced a full foreground snapshot");
  JSONObject revised=new JSONObject().put("t",minute-2*60000).put("o",102).put("h",120).put("l",98).put("c",110).put("source","gains-history");MarketStore.merge(77,new JSONArray().put(revised));JSONObject changed=new JSONObject(MarketStore.snapshotFor(77,revision));check(changed.getLong("candleRevision")>revision,"Changed historical bar did not advance revision");bars=changed.getJSONObject("selectedCandles").getJSONArray("77");check(bars.length()==4&&bars.getJSONObject(2).getDouble("h")==120,"Historical correction did not stay in its timestamp bucket");
  LinkedHashMap<Integer,String> plan=BackgroundHistoryPlan.markets("{\"pair\":33,\"symbol\":\"SOL/USD\"}");check("SOL-USD".equals(plan.get(33)),"Selected market absent from background catch-up");check(BackgroundHistoryPlan.markets("{\"pair\":33,\"symbol\":\"../../bad\"}").get(33)==null,"Unsafe history symbol accepted");
  System.out.println("PASS: chronological multi-bar replay, idempotent native revisions, historical correction and selected-market background catch-up.");
 }
}

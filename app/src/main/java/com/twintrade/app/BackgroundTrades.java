package com.twintrade.app;
import java.net.URI;import java.util.*;import java.util.function.*;import org.json.*;import org.java_websocket.client.WebSocketClient;import org.java_websocket.handshake.ServerHandshake;
/** Public read-only execution streams; no wallet or signing functionality. */
public final class BackgroundTrades {
 private volatile boolean stopped=false;private final Object transportLock=new Object();private final ArrayList<BackgroundPriceFeed> feeds=new ArrayList<>();private final LinkedHashMap<String,String> seen=new LinkedHashMap<>();private final Consumer<JSONObject> listener;private final LongSupplier clock;
 public BackgroundTrades(Consumer<JSONObject> listener,LongSupplier clock){this.listener=listener;this.clock=clock;}
 public void poll(boolean active){synchronized(transportLock){if(stopped||!active){close();return;}if(feeds.isEmpty())for(String chain:new String[]{"polygon","arbitrum","base"}){
  final String net=chain.toUpperCase(java.util.Locale.US);
  feeds.add(new BackgroundPriceFeed(clock,events->{
   WebSocketClient client=new WebSocketClient(new URI("wss://backend-"+chain+".gains.trade")){
    public void onOpen(ServerHandshake h){events.open();}public void onMessage(String raw){events.message(raw);}public void onClose(int c,String r,boolean remote){events.failed();}public void onError(Exception e){events.failed();}
   };client.setConnectionLostTimeout(15);return new BackgroundPriceFeed.Transport(){public void connect(){client.connect();}public void close(){client.closeConnection(1000,"Background stream stopped");}};
  },raw->{accept(raw,net);return 1;},status->{},()->{}));
 }for(BackgroundPriceFeed feed:feeds)feed.poll();}}
 public synchronized void accept(String raw,String net){if(raw==null||raw.length()>2000000)return;try{
  JSONObject msg=new JSONObject(raw);String name=msg.optString("name");
  if(name.equals("liveEvent")||name.equals("liveEvents")){Object value=msg.opt("value");JSONArray values=value instanceof JSONArray?(JSONArray)value:new JSONArray().put(value);for(int i=0;i<values.length();i++){JSONObject ev=values.optJSONObject(i);if(ev==null)continue;String event=ev.optString("event",ev.optString("name",ev.optString("eventName")));if(!event.equals("MarketExecuted")&&!event.equals("LimitExecuted"))continue;JSONObject args=ev.optJSONObject("args");if(args==null)args=ev.optJSONObject("returnValues");if(args==null)args=ev;Object tuple=args.opt("t");if(tuple==null)tuple=args.opt("trade");JSONObject trade=tuple instanceof JSONObject?(JSONObject)tuple:null;if(tuple instanceof JSONArray){JSONArray a=(JSONArray)tuple;trade=new JSONObject();String[] keys={"user","index","pairIndex","leverage","long","isOpen","collateralIndex","tradeType","collateralAmount","openPrice"};for(int k=0;k<keys.length&&k<a.length();k++)trade.put(keys[k],a.get(k));}if(trade==null)continue;boolean open=event.equals("LimitExecuted")?(args.optInt("orderType")==2||args.optInt("orderType")==3):args.optBoolean("open");String action=open?"open":event.equals("LimitExecuted")&&args.optInt("orderType")==6?"liq":"close";emit(trade.getString("user"),String.valueOf(trade.get("index")),trade.getInt("pairIndex"),"",trade.getBoolean("long"),action,net);}}
  else if(name.equals("new-trade-history")){JSONObject g=msg.optJSONObject("value");if(g==null)g=msg;String a=g.optString("action"),action=a.startsWith("TradeOpened")?"open":a.equals("TradeClosedLIQ")?"liq":a.startsWith("TradeClosed")?"close":"";if(action.isEmpty())return;emit(g.getString("address"),String.valueOf(g.get("tradeIndex")),-1,g.getString("pair"),g.optBoolean("long")||g.optInt("long")==1,action,net);}
 }catch(Exception ignored){}}
 private void emit(String user,String index,int pair,String symbol,boolean side,String action,String net)throws JSONException{String id=net+":"+user.toLowerCase(java.util.Locale.US)+":"+index,old=seen.get(id);if(action.equals(old)||"liq".equals(old)&&action.equals("close"))return;seen.remove(id);seen.put(id,action);while(seen.size()>1000)seen.remove(seen.keySet().iterator().next());listener.accept(new JSONObject().put("id",id).put("pair",pair).put("symbol",symbol).put("long",side).put("action",action).put("net",net).put("at",System.currentTimeMillis()));}
 public void stop(){stopped=true;close();}
 public void close(){synchronized(transportLock){for(BackgroundPriceFeed feed:feeds)feed.close();feeds.clear();}}
}

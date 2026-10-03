package com.twintrade.app;
import org.json.*;
/** Parse live frames identically for native and foreground recovery transports. */
public final class PriceFeed {
 public static int ingest(String raw,long received){
  if(raw==null||raw.length()>1000000||received<=0||received>System.currentTimeMillis())return 0;
  try{JSONObject frame=raw.trim().startsWith("{")?new JSONObject(raw):null;long stamp=frame==null?received:frame.optLong("t",received);if(stamp>=1000000000L&&stamp<1000000000000L)stamp*=1000;if(stamp<=0)stamp=received;
   if(stamp>received||received-stamp>=5000){MarketStore.feedError="Rejected price timestamp · check device date/time";return 0;}
   int index=apply(frame==null?null:frame.optJSONArray("i"),stamp,true),mark=apply(frame==null?new JSONArray(raw):frame.optJSONArray("m"),stamp,false);
   if(mark+index>0){MarketStore.feedError="";MarketStore.lastAcceptedFrame=received;}return mark+index;
  }catch(Exception e){MarketStore.feedError="Invalid price frame";return 0;}
 }
 private static int apply(JSONArray a,long stamp,boolean index){if(a==null||a.length()<2||a.length()%2!=0)return 0;int count=0;for(int k=0;k<a.length();k+=2){try{Object id=a.get(k),v=a.get(k+1);if(!(id instanceof Number)||!(v instanceof Number))continue;double pi=((Number)id).doubleValue(),value=((Number)v).doubleValue();if(!Double.isFinite(pi)||pi!=Math.rint(pi)||pi<0||pi>1000||!Double.isFinite(value)||value<=0)continue;int pair=(int)pi;if(index)MarketStore.indexTick(pair,value,stamp);else MarketStore.tick(pair,value,stamp);count++;}catch(Exception ignored){}}return count;}
}

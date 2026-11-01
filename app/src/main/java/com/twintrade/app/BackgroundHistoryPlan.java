package com.twintrade.app;
import org.json.*;import java.util.*;
/** Select bounded Gains history catch-up markets for the native monitor. */
public final class BackgroundHistoryPlan {
 public static LinkedHashMap<Integer,String> markets(String state){LinkedHashMap<Integer,String> out=new LinkedHashMap<>();out.put(0,"BTC-USD");out.put(1,"ETH-USD");out.put(300,"BTCDEGEN-USD");out.put(313,"ETHDEGEN-USD");try{JSONObject s=new JSONObject(state==null?"{}":state);int pair=s.optInt("pair",-1);String symbol=s.optString("symbol","").toUpperCase(java.util.Locale.US).replace('/','-');if(pair>=0&&pair<=1000&&symbol.matches("[A-Z0-9]+-USD"))out.put(pair,symbol);}catch(Exception ignored){}return out;}
 private BackgroundHistoryPlan(){}
}

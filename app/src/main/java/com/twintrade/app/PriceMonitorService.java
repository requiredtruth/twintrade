package com.twintrade.app;
import android.app.*;import android.content.*;import android.content.pm.ServiceInfo;import android.os.*;import org.json.*;import java.net.*;import java.io.*;import java.util.concurrent.*;
public class PriceMonitorService extends Service {
 private BackgroundPriceFeed feed;private final ScheduledExecutorService jobs=Executors.newScheduledThreadPool(2);private PowerManager.WakeLock wake;private volatile boolean stopped=false;private volatile boolean historyBusy=false;
 public void onCreate(){super.onCreate();MarketStore.init(this);NotificationManager nm=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);nm.createNotificationChannel(new NotificationChannel("prices","Background market monitoring",NotificationManager.IMPORTANCE_LOW));Intent launch=new Intent(this,MainActivity.class);PendingIntent open=PendingIntent.getActivity(this,0,launch,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Intent stop=new Intent(this,PriceMonitorService.class).setAction("STOP");PendingIntent stopAction=PendingIntent.getService(this,1,stop,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Notification n=new Notification.Builder(this,"prices").setContentTitle("TwinTrade is monitoring markets").setContentText("Candles and paper positions continue in the background").setSmallIcon(android.R.drawable.ic_menu_recent_history).setContentIntent(open).setOngoing(true).addAction(new Notification.Action.Builder(null,"Stop monitoring",stopAction).build()).build();try{if(Build.VERSION.SDK_INT>=34)startForeground(42,n,ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);else startForeground(42,n);}catch(RuntimeException e){MarketStore.running=false;MarketStore.status="Background monitor unavailable · foreground prices active";android.util.Log.w("TwinTrade","Foreground registration rejected",e);stopped=true;jobs.shutdownNow();stopSelf();return;}wake=((PowerManager)getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"TwinTrade:Prices");try{wake.acquire();}catch(SecurityException e){android.util.Log.w("TwinTrade","Wake lock unavailable",e);}}
 private synchronized void startMonitoring(){
  if(stopped||feed!=null)return;MarketStore.running=true;
  feed=new BackgroundPriceFeed(()->{try{jobs.execute(this::history);}catch(RejectedExecutionException ignored){}},SystemClock::elapsedRealtime);
  jobs.scheduleWithFixedDelay(()->{try{feed.poll();}catch(Exception e){android.util.Log.w("TwinTrade","Background watchdog failed",e);}},0,3,TimeUnit.SECONDS);
  jobs.scheduleWithFixedDelay(this::history,0,60,TimeUnit.SECONDS);
 }
 private JSONObject getJson(String url)throws Exception{HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setConnectTimeout(15000);c.setReadTimeout(15000);try{if(c.getResponseCode()!=200)throw new IOException("HTTP "+c.getResponseCode());ByteArrayOutputStream bytes=new ByteArrayOutputStream();try(InputStream in=c.getInputStream()){byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1)bytes.write(b,0,n);}return new JSONObject(bytes.toString("UTF-8"));}finally{c.disconnect();}}
 private void history(){synchronized(this){if(historyBusy||stopped)return;historyBusy=true;}boolean ok=false;try{
  try{JSONObject r=getJson("https://backend-pricing.eu.gains.trade/charts");JSONArray os=r.getJSONArray("opens"),hs=r.getJSONArray("highs"),ls=r.getJSONArray("lows"),cs=r.getJSONArray("closes");for(int i=0;i<Math.min(Math.min(os.length(),hs.length()),Math.min(ls.length(),cs.length()))&&i<=1000&&!stopped;i++){if(os.isNull(i)||hs.isNull(i)||ls.isNull(i)||cs.isNull(i))continue;MarketStore.seedOhlc(i,os.getDouble(i),hs.getDouble(i),ls.getDouble(i),cs.getDouble(i),r.optLong("time",System.currentTimeMillis()));ok=true;}}catch(Exception ignored){}
  int[] pairs={0,1,300,313};String[] symbols={"BTC-USD","ETH-USD","BTCDEGEN-USD","ETHDEGEN-USD"};
  for(int i=0;i<pairs.length&&!stopped;i++){for(String chain:new String[]{"polygon","arbitrum"}){if(stopped)break;try{long to=System.currentTimeMillis(),from=to-300*60000L;JSONArray rows=getJson("https://api.gains.trade/v1/"+chain+"/markets/"+symbols[i]+"/candles?interval=1m&from="+from+"&to="+to).getJSONArray("data"),a=new JSONArray();for(int k=0;k<rows.length();k++){JSONObject r=rows.getJSONObject(k);double o=r.getDouble("open"),h=r.getDouble("high"),l=r.getDouble("low"),close=r.getDouble("close");long t=r.getLong("time");if(t>=1000000000L&&t<1000000000000L)t*=1000;t=t/60000*60000;if(t>0&&t<=to&&Double.isFinite(o)&&Double.isFinite(h)&&Double.isFinite(l)&&Double.isFinite(close)&&l>0&&h>=Math.max(o,close)&&l<=Math.min(o,close))a.put(new JSONObject().put("t",t).put("o",o).put("h",h).put("l",l).put("c",close).put("source","gains-history"));}if(stopped)return;MarketStore.merge(pairs[i],a);MarketStore.save(true);ok=true;break;}catch(Exception ignored){}}}
  if(!stopped)MarketStore.historyStatus=ok?"Gains history + live · 1m":"History unavailable · cached/live candles shown";
 }finally{historyBusy=false;/* The fixed-delay job already retries every minute; never fork retry chains. */}}
 public int onStartCommand(Intent i,int flags,int id){
  if((i!=null&&"STOP".equals(i.getAction()))||!getSharedPreferences("market",0).getBoolean("keepAlive",true)){
   getSharedPreferences("market",0).edit().putBoolean("keepAlive",false).apply();
   stopMonitoring();stopSelf();return START_NOT_STICKY;
  }
  startMonitoring();
  if(i!=null&&"RECONNECT".equals(i.getAction())&&feed!=null)feed.reconnect();
  return stopped?START_NOT_STICKY:START_STICKY;
 }
 public IBinder onBind(Intent i){return null;}
 private synchronized void stopMonitoring(){
  if(stopped)return;stopped=true;
  if(feed!=null)feed.close();
  jobs.shutdownNow();MarketStore.running=false;MarketStore.status="Monitoring stopped";
  MarketStore.save(true);if(wake!=null&&wake.isHeld())wake.release();
 }
 public void onDestroy(){stopMonitoring();stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy();}
}

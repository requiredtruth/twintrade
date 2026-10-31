package com.twintrade.audiotest;
import android.app.*;import android.content.*;import android.os.*;import com.twintrade.app.*;
public class AudioRecoveryTest extends Instrumentation {
 @Override public void onCreate(Bundle args){super.onCreate(args);start();}
 @Override public void onStart(){Bundle result=new Bundle();try{
  Activity activity=startActivitySync(new Intent(getTargetContext(),MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
  java.lang.reflect.Field ready=MainActivity.class.getDeclaredField("pageReady");ready.setAccessible(true);
  for(int i=0;i<100&&!ready.getBoolean(activity);i++)Thread.sleep(200);
  if(!ready.getBoolean(activity))throw new AssertionError("Trading page not ready");
  java.lang.reflect.Field field=MainActivity.class.getDeclaredField("audio");field.setAccessible(true);NativeAudio audio=(NativeAudio)field.get(activity);
  setSounds(activity,true);Thread.sleep(300);
  checkSound(audio,"short click",.05);checkSound(audio,"initial");
  for(int kind:new int[]{1,2}){
   audio.tone(660,2,"sine",.1,0);audio.tone(440,2,"sine",.1,1.5);Thread.sleep(80);
   getTargetContext().startForegroundService(new Intent().setComponent(new ComponentName("com.twintrade.audiotest","com.twintrade.audiotest.CompetingAudio")).putExtra("kind",kind));
   boolean lost=false;for(int i=0;i<80;i++){Thread.sleep(50);if(audio.status().equals("interrupted")){lost=true;break;}}
   if(!lost)throw new AssertionError("Competing app did not interrupt focus, kind="+kind+" state="+audio.status());
   Thread.sleep(3500);checkSound(audio,"after competing app, kind="+kind);
  }
  setSounds(activity,false);Thread.sleep(300);long before=audio.playedFrames();audio.tone(440,.2,"sine",.1,0);Thread.sleep(300);if(audio.playedFrames()!=before)throw new AssertionError("Mute ignored");
  setSounds(activity,true);Thread.sleep(300);checkSound(audio,"unmuted");
  checkBackground(activity);
  result.putString("stream","PASS: native PCM output before and after separate-app permanent/transient audio focus, and mute; native background Home/screen-off playback and ownership handoff\n");finish(Activity.RESULT_OK,result);
 }catch(Throwable e){result.putString("stream","FAIL: "+e+"\n");finish(Activity.RESULT_CANCELED,result);}}
 private void shell(String command)throws Exception{try(android.os.ParcelFileDescriptor.AutoCloseInputStream in=new android.os.ParcelFileDescriptor.AutoCloseInputStream(getUiAutomation().executeShellCommand(command))){byte[] b=new byte[1024];while(in.read(b)!=-1){}}}

 private void checkBackground(Activity activity)throws Exception{
  MarketStore.reset();setSounds(activity,true);Thread.sleep(300);
  java.lang.reflect.Field singleton=PriceMonitorService.class.getDeclaredField("instance");singleton.setAccessible(true);Object service=singleton.get(null);if(service==null)throw new AssertionError("Native monitor service unavailable");
  java.lang.reflect.Field field=PriceMonitorService.class.getDeclaredField("backgroundAudio");field.setAccessible(true);NativeAudio bg=(NativeAudio)field.get(service);
  java.lang.reflect.Method frame=PriceMonitorService.class.getDeclaredMethod("acceptBackgroundFrame",String.class);frame.setAccessible(true);
  shell("input keyevent KEYCODE_HOME");Thread.sleep(500);if(MainActivity.visible)throw new AssertionError("Activity did not leave foreground");
  checkBackgroundPulse(service,frame,bg,100,"Home");
  shell("input keyevent KEYCODE_SLEEP");Thread.sleep(300);checkBackgroundPulse(service,frame,bg,200,"screen off");
  android.content.Context context=getTargetContext();context.getSharedPreferences("market",0).edit().putString("audioState","{\"pair\":0,\"events\":false,\"ticks\":false}").commit();PriceMonitorService.visibilityChanged();Thread.sleep(500);long muted=bg.playedFrames();
  frame.invoke(service,"{\"t\":"+System.currentTimeMillis()+",\"m\":[0,201]}");Thread.sleep(300);if(bg.playedFrames()!=muted)throw new AssertionError("Background mute ignored");
  shell("input keyevent KEYCODE_WAKEUP");shell("wm dismiss-keyguard");
  runOnMainSync(()->context.startActivity(new Intent(context,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)));Thread.sleep(1000);if(!MainActivity.visible)throw new AssertionError("Activity failed to resume");
  long foreground=bg.playedFrames();frame.invoke(service,"{\"t\":"+System.currentTimeMillis()+",\"m\":[0,202]}");Thread.sleep(300);if(bg.playedFrames()!=foreground)throw new AssertionError("Background player duplicated foreground audio");
  android.util.Log.i("TwinTrade","PASS: native background PCM with Home/screen off, mute and foreground ownership handoff");
 }
 private void checkBackgroundPulse(Object service,java.lang.reflect.Method frame,NativeAudio audio,double price,String stage)throws Exception{long before=audio.playedFrames();for(int i=0;i<4;i++){frame.invoke(service,"{\"t\":"+System.currentTimeMillis()+",\"m\":[0,"+(price+i*.001)+"]}");Thread.sleep(120);}for(int i=0;i<20&&audio.playedFrames()<=before;i++)Thread.sleep(100);if(audio.playedFrames()<=before)throw new AssertionError("No native background PCM "+stage+": "+audio.status());}
 private void setSounds(Activity activity,boolean enabled)throws Exception{java.lang.reflect.Field f=MainActivity.class.getDeclaredField("web");f.setAccessible(true);android.webkit.WebView web=(android.webkit.WebView)f.get(activity);runOnMainSync(()->web.evaluateJavascript("onTick=()=>{};eventSound=()=>{};onCandleClose=()=>{};soundOn="+enabled+";tickOn="+enabled+";renderAudioStatus();",null));}
 private void checkSound(NativeAudio audio,String stage)throws Exception{checkSound(audio,stage,.5);}
 private void checkSound(NativeAudio audio,String stage,double duration)throws Exception{long before=audio.playedFrames();audio.tone(880,duration,"triangle",.12,0);for(int i=0;i<20&&audio.playedFrames()<=before;i++)Thread.sleep(100);if(audio.playedFrames()<=before)throw new AssertionError("No PCM playback "+stage+": "+audio.status());Thread.sleep(1000);}
}

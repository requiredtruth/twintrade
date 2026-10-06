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
  result.putString("stream","PASS: native PCM output before and after separate-app permanent/transient audio focus, and mute\n");finish(Activity.RESULT_OK,result);
 }catch(Throwable e){result.putString("stream","FAIL: "+e+"\n");finish(Activity.RESULT_CANCELED,result);}}
 private void setSounds(Activity activity,boolean enabled)throws Exception{java.lang.reflect.Field f=MainActivity.class.getDeclaredField("web");f.setAccessible(true);android.webkit.WebView web=(android.webkit.WebView)f.get(activity);runOnMainSync(()->web.evaluateJavascript("onTick=()=>{};eventSound=()=>{};onCandleClose=()=>{};soundOn="+enabled+";tickOn="+enabled+";renderAudioStatus();",null));}
 private void checkSound(NativeAudio audio,String stage)throws Exception{checkSound(audio,stage,.5);}
 private void checkSound(NativeAudio audio,String stage,double duration)throws Exception{long before=audio.playedFrames();audio.tone(880,duration,"triangle",.12,0);for(int i=0;i<20&&audio.playedFrames()<=before;i++)Thread.sleep(100);if(audio.playedFrames()<=before)throw new AssertionError("No PCM playback "+stage+": "+audio.status());Thread.sleep(1000);}
}

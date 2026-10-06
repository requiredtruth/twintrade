package com.twintrade.app;

import android.content.Context;
import android.media.*;
import android.os.*;
import android.webkit.JavascriptInterface;
import java.util.ArrayList;

/** Short sonification bursts, independent of Chromium's media focus/session. */
public final class NativeAudio {
 private static final int RATE=24000, BLOCK=480;
 private final HandlerThread thread=new HandlerThread("TwinTradeAudio");
 private final Handler handler;
 private final AudioManager manager;
 private final AudioAttributes attributes=new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
 private final AudioFocusRequest focus;
 private final ArrayList<Note> notes=new ArrayList<>();
 private AudioTrack track;
 private boolean foreground=false,enabled=false,focused=false,pumping=false,waiting=false;
 private long cursor=0,lastHead=0;
 private volatile String state="ready";
 private volatile long playedFrames=0;
 private final Runnable pump=this::pump;
 private final Runnable idle=this::release;
 private static final class Note {
  final double frequency,gain;final String type;final long start,end;
  Note(double f,double g,String t,long s,long e){frequency=f;gain=g;type=t;start=s;end=e;}
 }
 public NativeAudio(Context context){
  manager=(AudioManager)context.getSystemService(Context.AUDIO_SERVICE);
  thread.start();handler=new Handler(thread.getLooper());
  focus=new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK).setAudioAttributes(attributes).setOnAudioFocusChangeListener(change->{
   if(change==AudioManager.AUDIOFOCUS_GAIN){focused=true;waiting=false;if(track!=null)track.setVolume(1);state="ready";}
   else if(change==AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK){if(track!=null)track.setVolume(.25f);}
   else {waiting=change==AudioManager.AUDIOFOCUS_LOSS_TRANSIENT;focused=false;stopTrack();notes.clear();state="interrupted";}
  },handler).build();
 }
 public void foreground(boolean value){handler.post(()->{foreground=value;if(!value)release();else {waiting=false;state="ready";}});}
 @JavascriptInterface public void enabled(boolean value){handler.post(()->{if(enabled==value)return;enabled=value;if(!value)release();});}
 @JavascriptInterface public String status(){return state;}
 public long playedFrames(){return playedFrames;}
 @JavascriptInterface public void tone(double frequency,double duration,String type,double gain,double delay){
  if(!Double.isFinite(frequency)||!Double.isFinite(duration)||!Double.isFinite(gain)||!Double.isFinite(delay)||frequency<20||frequency>10000||duration<=0||duration>2||delay<0||delay>2)return;
  handler.post(()->{
   if(!foreground||!enabled||waiting)return;
   handler.removeCallbacks(idle);
   // A permanent loss does not send GAIN later: reacquire on the next burst.
   if(!focused){focused=manager.requestAudioFocus(focus)==AudioManager.AUDIOFOCUS_REQUEST_GRANTED;if(!focused){state="focus unavailable";return;}}
   try{
    if(track==null){track=new AudioTrack.Builder().setAudioAttributes(attributes).setAudioFormat(new AudioFormat.Builder().setSampleRate(RATE).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).setEncoding(AudioFormat.ENCODING_PCM_16BIT).build()).setBufferSizeInBytes(Math.max(BLOCK*4,AudioTrack.getMinBufferSize(RATE,AudioFormat.CHANNEL_OUT_MONO,AudioFormat.ENCODING_PCM_16BIT))).setTransferMode(AudioTrack.MODE_STREAM).build();cursor=0;lastHead=0;track.play();}
    if(notes.size()>=32)notes.remove(0);
    long start=cursor+(long)(delay*RATE);notes.add(new Note(frequency,Math.max(0,Math.min(.3,gain)),type,start,start+(long)(duration*RATE)));
    state="running";if(!pumping){pumping=true;handler.post(pump);}
   }catch(RuntimeException error){release();state="retry on next sound";}
  });
 }
 private void pump(){
  pumping=false;if(track==null||!focused||!foreground||!enabled)return;
  if(notes.isEmpty()){handler.postDelayed(idle,150);return;}
  short[] pcm=new short[BLOCK];
  for(int i=0;i<BLOCK;i++){
   long frame=cursor+i;double sum=0;
   for(Note n:notes){if(frame<n.start||frame>=n.end)continue;double elapsed=(frame-n.start)/(double)RATE,phase=elapsed*n.frequency;double wave;
    switch(n.type){case "square":wave=Math.sin(phase*2*Math.PI)>=0?1:-1;break;case "triangle":wave=2/Math.PI*Math.asin(Math.sin(phase*2*Math.PI));break;case "sawtooth":wave=2*(phase-Math.floor(phase+.5));break;default:wave=Math.sin(phase*2*Math.PI);}
    double total=(n.end-n.start)/(double)RATE,attack=Math.min(.015,total/2),envelope=elapsed<attack?.0001*Math.pow(Math.max(.001,n.gain)/.0001,elapsed/attack):Math.max(.001,n.gain)*Math.pow(.0001/Math.max(.001,n.gain),(elapsed-attack)/(total-attack));sum+=wave*envelope;
   }
   pcm[i]=(short)(Math.max(-1,Math.min(1,sum))*32767);
  }
  try{
   int written=track.write(pcm,0,pcm.length,AudioTrack.WRITE_BLOCKING);
   if(written<0)throw new IllegalStateException("Audio write failed: "+written);
   cursor+=written;long head=Integer.toUnsignedLong(track.getPlaybackHeadPosition());playedFrames+=Math.max(0,head-lastHead);lastHead=head;
   notes.removeIf(n->n.end<=cursor);
   pumping=true;handler.post(pump);
  }catch(RuntimeException error){release();state="retry on next sound";}
 }
 private void stopTrack(){handler.removeCallbacks(pump);handler.removeCallbacks(idle);pumping=false;if(track!=null){try{track.pause();track.flush();track.release();}catch(RuntimeException ignored){}track=null;}cursor=0;}
 private void release(){stopTrack();notes.clear();manager.abandonAudioFocusRequest(focus);focused=false;waiting=false;state=enabled?"ready":"muted";}
 public void close(){handler.post(()->{foreground=false;release();thread.quitSafely();});}
}

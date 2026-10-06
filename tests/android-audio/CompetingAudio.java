package com.twintrade.audiotest;
import android.app.*;import android.content.*;import android.media.*;import android.os.*;
/** A genuinely separate application takes focus and plays PCM, then releases it. */
public class CompetingAudio extends Service {
 private AudioManager manager;private AudioFocusRequest focus;private AudioTrack track;
 public IBinder onBind(Intent i){return null;}
 public int onStartCommand(Intent i,int flags,int id){
  NotificationManager notifications=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);notifications.createNotificationChannel(new NotificationChannel("audio-test","Audio focus test",NotificationManager.IMPORTANCE_LOW));
  startForeground(42,new Notification.Builder(this,"audio-test").setSmallIcon(android.R.drawable.ic_media_play).setContentTitle("Competing audio test").build());
  manager=(AudioManager)getSystemService(AUDIO_SERVICE);
  AudioAttributes attributes=new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
  focus=new AudioFocusRequest.Builder(i.getIntExtra("kind",1)==1?AudioManager.AUDIOFOCUS_GAIN:AudioManager.AUDIOFOCUS_GAIN_TRANSIENT).setAudioAttributes(attributes).setOnAudioFocusChangeListener(change->{}).build();
  if(manager.requestAudioFocus(focus)!=AudioManager.AUDIOFOCUS_REQUEST_GRANTED)throw new IllegalStateException("Competitor denied focus");
  short[] pcm=new short[24000*4];for(int n=0;n<pcm.length;n++)pcm[n]=(short)(Math.sin(n*440*2*Math.PI/24000)*1000);
  track=new AudioTrack.Builder().setAudioAttributes(attributes).setAudioFormat(new AudioFormat.Builder().setSampleRate(24000).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).setEncoding(AudioFormat.ENCODING_PCM_16BIT).build()).setTransferMode(AudioTrack.MODE_STATIC).setBufferSizeInBytes(pcm.length*2).build();track.write(pcm,0,pcm.length);track.play();new Handler().postDelayed(()->stopSelf(),3000);return START_NOT_STICKY;
 }
 public void onDestroy(){if(track!=null){track.stop();track.release();}if(manager!=null)manager.abandonAudioFocusRequest(focus);super.onDestroy();}
}

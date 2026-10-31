package com.twintrade.app;

/** Gentle, side-specific public execution cues shared by background playback. */
public final class EventSoundPalette {
 public interface Output { void tone(double frequency,double duration,String type,double gain,double delay); }
 private EventSoundPalette(){}
 public static int priority(String action){return "liq".equals(action)?3:"close".equals(action)?2:1;}
 public static final class BurstGate {
  private long lastAt=Long.MIN_VALUE;private int lastPriority=0;
  /** -1 suppress, 0 play, 1 replace the still-sounding lower-priority cue. */
  public int accept(String action,long now){int priority=priority(action);if(lastAt!=Long.MIN_VALUE&&now-lastAt<240){if(priority<=lastPriority)return -1;lastAt=now;lastPriority=priority;return 1;}lastAt=now;lastPriority=priority;return 0;}
 }
 public static void play(Output out,String action,boolean side){
  if("open".equals(action)){
   if(side){out.tone(523,.07,"warm",.055,0);out.tone(659,.10,"chime",.060,.075);out.tone(784,.13,"chime",.050,.15);}
   else {out.tone(659,.07,"warm",.055,0);out.tone(494,.10,"warm",.060,.075);out.tone(392,.13,"chime",.050,.15);}
  }else if("liq".equals(action)){
   if(side){out.tone(247,.11,"warm",.060,0);out.tone(196,.14,"warm",.055,.10);out.tone(147,.18,"sine",.045,.22);}
   else {out.tone(196,.11,"warm",.060,0);out.tone(247,.14,"warm",.055,.10);out.tone(330,.18,"sine",.045,.22);}
  }else{
   if(side){out.tone(784,.07,"chime",.050,0);out.tone(659,.10,"warm",.055,.075);out.tone(523,.14,"warm",.045,.15);}
   else {out.tone(392,.07,"chime",.050,0);out.tone(494,.10,"warm",.055,.075);out.tone(587,.14,"warm",.045,.15);}
  }
 }
}

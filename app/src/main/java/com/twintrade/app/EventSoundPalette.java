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
 public static void settlement(Output out,String action,boolean longSide,double net){
  if("liq".equals(action)){
   out.tone(longSide?175:196,.19,"buzzer",.22,0);
   out.tone(longSide?131:147,.32,"buzzer",.23,.19);
  }else if(net>0){
   out.tone(523,.09,"chime",.08,0);out.tone(659,.09,"chime",.08,.085);
   out.tone(784,.1,"chime",.085,.17);out.tone(1047,.23,"chime",.085,.26);
  }else if(net<0)out.tone(330,.22,"warm",.075,0);
  else{out.tone(587,.09,"warm",.055,0);out.tone(659,.14,"chime",.05,.09);}
 }
 public static void play(Output out,String action,boolean side){play(out,action,side,"gentle");}
 public static void play(Output out,String action,boolean side,String profile){
  final String selected="warm".equals(profile)||"minimal".equals(profile)?profile:"gentle";
  Output target=(frequency,duration,type,gain,delay)->emit(out,selected,frequency,duration,type,gain,delay);
  if("profit".equals(action)){target.tone(523,.08,"warm",.052,0);emit(out,selected,698,.13,"chime",.055,.09,true);return;}
  if("loss".equals(action)){target.tone(494,.08,"warm",.048,0);emit(out,selected,370,.13,"warm",.050,.09,true);return;}
  if("open".equals(action)){
   if(side){target.tone(523,.07,"warm",.055,0);target.tone(659,.10,"chime",.060,.075);target.tone(784,.13,"chime",.050,.15);}
   else {target.tone(659,.07,"warm",.055,0);target.tone(494,.10,"warm",.060,.075);target.tone(392,.13,"chime",.050,.15);}
  }else if("liq".equals(action)){
   if(side){target.tone(247,.11,"warm",.060,0);target.tone(196,.14,"warm",.055,.10);target.tone(147,.18,"sine",.045,.22);}
   else {target.tone(196,.11,"warm",.060,0);target.tone(247,.14,"warm",.055,.10);target.tone(330,.18,"sine",.045,.22);}
  }else{
   if(side){target.tone(784,.07,"chime",.050,0);target.tone(659,.10,"warm",.055,.075);target.tone(523,.14,"warm",.045,.15);}
   else {target.tone(392,.07,"chime",.050,0);target.tone(494,.10,"warm",.055,.075);target.tone(587,.14,"warm",.045,.15);}
  }
 }
 private static void emit(Output out,String selected,double frequency,double duration,String type,double gain,double delay){emit(out,selected,frequency,duration,type,gain,delay,false);}
 private static void emit(Output out,String selected,double frequency,double duration,String type,double gain,double delay,boolean keepMinimal){
  if("minimal".equals(selected)&&!keepMinimal&&delay>0&&delay<.14)return;
  if("warm".equals(selected)){frequency*=.88;if("chime".equals(type))type="warm";gain*=.9;}
  else if("minimal".equals(selected)){duration*=.9;gain*=.85;if(delay>0)delay=Math.min(delay,.11);}
  out.tone(frequency,duration,type,gain,delay);
 }
}

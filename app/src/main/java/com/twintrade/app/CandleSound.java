package com.twintrade.app;
/** Quiet minute-close phrases shared by foreground semantics and background playback. */
public final class CandleSound {
 public interface Output { void tone(double frequency,double duration,String type,double gain,double delay); }
 private CandleSound(){}
 public static void play(Output out,boolean up,double averageNet,double level){double scale=Double.isFinite(level)&&level>0&&level<=1?level:1;int mood=Double.isFinite(averageNet)?averageNet>0?1:averageNet<0?-1:0:0;
  if(up){if(mood>0){tone(out,494,.08,"warm",.045,0,scale);tone(out,622,.12,"chime",.052,.08,scale);}else if(mood<0)tone(out,392,.11,"warm",.040,0,scale);else{tone(out,466,.09,"warm",.043,0,scale);tone(out,554,.11,"chime",.045,.08,scale);}}
  else{if(mood<0){tone(out,392,.08,"warm",.045,0,scale);tone(out,311,.13,"warm",.052,.08,scale);}else if(mood>0)tone(out,440,.11,"warm",.040,0,scale);else{tone(out,415,.09,"warm",.043,0,scale);tone(out,349,.12,"warm",.045,.08,scale);}}
 }
 private static void tone(Output out,double f,double d,String t,double g,double w,double level){out.tone(f,d,t,g*level,w);}
}

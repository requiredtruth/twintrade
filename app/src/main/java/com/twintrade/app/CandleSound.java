package com.twintrade.app;
/** Quiet minute-close phrases shared by foreground semantics and background playback. */
public final class CandleSound {
 public interface Output { void tone(double frequency,double duration,String type,double gain,double delay); }
 private CandleSound(){}
 public static void play(Output out,double move,double exposure,double level){
  double scale=Double.isFinite(level)&&level>0&&level<=1?level:1;
  boolean favorable=exposure==0?move>=0:move*exposure>0;
  if(exposure!=0&&move==0)tone(out,440,.11,"warm",.04,0,scale);
  else if(favorable){tone(out,466,.09,"warm",.043,0,scale);tone(out,554,.11,"chime",.045,.08,scale);}
  else{tone(out,415,.09,"warm",.043,0,scale);tone(out,349,.12,"warm",.045,.08,scale);}
 }
 private static void tone(Output out,double f,double d,String t,double g,double w,double level){out.tone(f,d,t,g*level,w);}
}

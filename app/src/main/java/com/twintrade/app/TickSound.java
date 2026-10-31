package com.twintrade.app;
import java.util.*;
/** Same short-pulse/hysteresis policy as Engine.tickMotion; no Android dependency. */
public final class TickSound {
 public interface Output{void tone(double frequency,double duration,String type,double gain,double delay);}
 private final Output out;private int key=-1,direction=0,opposite=0;private long at=0,lastSound=0,quietUntil=0;private double extreme=0,noise=0;private boolean beat=false;
 public TickSound(Output out){this.out=out;}
 public void tick(int pair,double prev,double next,long now,double avg,double exposure){
  tick(pair,prev,next,now,avg,exposure,1);
 }
 public void tick(int pair,double prev,double next,long now,double avg,double exposure,double level){
  double scale=Double.isFinite(level)&&level>0&&level<=1?level:1;
  if(!(prev>0&&next>0)||prev==next)return;double delta=next-prev,step=Math.abs(delta);int raw=delta>0?1:-1;boolean major=step/prev>=.00005;
  if(key!=pair||now-at>2000||direction==0){key=pair;direction=raw;extreme=next;noise=Math.min(step,prev*.00005);opposite=0;}else{double threshold=Math.max(next*.0000001,noise*2.5);noise=.85*noise+.15*Math.min(step,prev*.00005);if(raw==direction){opposite=0;extreme=direction>0?Math.max(extreme,next):Math.min(extreme,next);}else{opposite++;double retrace=direction*(extreme-next);if(major||retrace>=threshold&&(opposite>=3||step>=threshold*2)){direction=raw;extreme=next;opposite=0;}}}at=now;
  double abs=step/prev*100,cooldown=major?90:abs<.005?130:105;if(now-lastSound<cooldown)return;lastSound=now;beat=!beat;if(now<quietUntil)return;double base=Double.isFinite(avg)?avg>0?760:avg<0?420:620:620,g=Math.min(.095,.045+abs*1.1)*scale;boolean favorable=exposure==0?direction>0:direction*exposure>0;
  if(abs<.005){out.tone(frequency(base*(favorable?1.04:.96)*(beat?1.015:.985)),.035,favorable?"chime":"warm",g,0);return;}
  boolean up=direction>0,big=abs>=.05;double span=1+Math.min(abs,.5)*.9,f1=base*(up?span:1/span),f2=f1*(up?1.26:.79),dur=big?.13:.07;
  out.tone(frequency(f1),dur,"warm",g,0);out.tone(frequency(f2),dur+.02,up?"chime":"warm",g*.9,.07);if(big||Double.isFinite(avg)&&avg>5)out.tone(frequency(f2*(big?1.4:1.25)),.09,up?"chime":"warm",g*(big?.45:.55),.14);
 }
 private static double frequency(double value){return Math.max(220,Math.min(1080,value));}
 public void suppressUntil(long deadline){quietUntil=Math.max(quietUntil,deadline);}
 public void reset(){key=-1;direction=0;lastSound=0;}
}

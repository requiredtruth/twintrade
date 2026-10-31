import com.twintrade.app.TickSound;import java.util.*;
public class TickSoundTest {
 public static void main(String[] args){List<double[]> notes=new ArrayList<>();List<String> types=new ArrayList<>();TickSound sound=new TickSound((f,d,t,g,w)->{notes.add(new double[]{f,d,g,w});types.add(t);});
  double previous=100;long now=1000;for(double next:new double[]{100.001,100.000,100.001,100.000,100.001,100.000,99.999,99.998,99.997}){sound.tick(0,previous,next,now,10,1);previous=next;now+=100;}
  if(notes.size()!=5)throw new AssertionError("Micro cooldown must reduce spam without silencing cadence");for(double[] n:notes)if(n[1]>.04||n[3]!=0||n[2]>.095)throw new AssertionError("Micro notes overlap or exceed softened peak");
  if(!types.subList(0,4).stream().allMatch(t->t.equals("sine"))||!types.get(4).equals("triangle"))throw new AssertionError("One/two micro retreats must not reverse motif");
  int before=notes.size();sound.tick(0,previous,previous,now,10,1);if(notes.size()!=before)throw new AssertionError("Unchanged quote audible");sound.reset();sound.tick(0,100,99.999,now+100,10,-1);if(!types.get(types.size()-1).equals("sine")||notes.get(notes.size()-1)[0]<700)throw new AssertionError("Profitable short must retain bright/favorable mood");
  sound.suppressUntil(now+1000);before=notes.size();sound.tick(0,99.999,99.998,now+300,10,-1);sound.tick(0,99.998,99.997,now+900,10,-1);if(notes.size()!=before)throw new AssertionError("Event priority must suppress movement notes");sound.tick(0,99.997,99.996,now+1100,10,-1);if(notes.size()==before)throw new AssertionError("Movement sound did not resume after event phrase");
  List<Double> scaled=new ArrayList<>();TickSound quiet=new TickSound((f,d,t,g,w)->scaled.add(g));quiet.tick(0,100,100.001,now+2000,Double.NaN,0,.45);if(scaled.isEmpty()||Math.abs(scaled.get(0)-.0207)>.0001)throw new AssertionError("Background sound level not applied");
  System.out.println("PASS: native micro cadence, reversal hysteresis, short pleasant pulses and profitable-short mood.");
 }
}

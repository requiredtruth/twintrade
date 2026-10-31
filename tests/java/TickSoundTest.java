import com.twintrade.app.TickSound;import java.util.*;
public class TickSoundTest {
 public static void main(String[] args){List<double[]> notes=new ArrayList<>();List<String> types=new ArrayList<>();TickSound sound=new TickSound((f,d,t,g,w)->{notes.add(new double[]{f,d,g,w});types.add(t);});
  double previous=100;long now=1000;for(double next:new double[]{100.001,100.000,100.001,100.000,100.001,100.000,99.999,99.998}){sound.tick(0,previous,next,now,10,1);previous=next;now+=100;}
  if(notes.size()!=8)throw new AssertionError("Micro quote cadence was removed");for(double[] n:notes)if(n[1]>.04||n[3]!=0||n[2]>.095)throw new AssertionError("Micro notes overlap or exceed softened peak");
  if(!types.subList(0,7).stream().allMatch(t->t.equals("sine"))||!types.get(7).equals("triangle"))throw new AssertionError("One/two micro retreats must not reverse motif");
  int before=notes.size();sound.tick(0,previous,previous,now,10,1);if(notes.size()!=before)throw new AssertionError("Unchanged quote audible");sound.reset();sound.tick(0,100,99.999,now+100,10,-1);if(!types.get(types.size()-1).equals("sine")||notes.get(notes.size()-1)[0]<700)throw new AssertionError("Profitable short must retain bright/favorable mood");
  System.out.println("PASS: native micro cadence, reversal hysteresis, short pleasant pulses and profitable-short mood.");
 }
}

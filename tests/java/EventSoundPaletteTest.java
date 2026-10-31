import com.twintrade.app.EventSoundPalette;import java.util.*;
public class EventSoundPaletteTest {
 public static void main(String[] args){Set<String> signatures=new HashSet<>();for(String action:new String[]{"open","close","liq"})for(boolean side:new boolean[]{true,false}){List<String> notes=new ArrayList<>();EventSoundPalette.play((f,d,t,g,w)->{if(g>.065||d>.18)throw new AssertionError("Cue is too sharp or long");if(!t.equals("warm")&&!t.equals("chime")&&!t.equals("sine"))throw new AssertionError("Harsh waveform");notes.add(f+":"+d+":"+t+":"+g+":"+w);},action,side);if(notes.size()!=3)throw new AssertionError("Cue must be a short three-note phrase");signatures.add(notes.toString());}
  if(signatures.size()!=6)throw new AssertionError("Side/action cues are not distinct");
  if(!(EventSoundPalette.priority("liq")>EventSoundPalette.priority("close")&&EventSoundPalette.priority("close")>EventSoundPalette.priority("open")))throw new AssertionError("Burst priority");
  EventSoundPalette.BurstGate gate=new EventSoundPalette.BurstGate();if(gate.accept("open",1000)!=0||gate.accept("open",1100)!=-1||gate.accept("close",1150)!=1||gate.accept("open",1200)!=-1||gate.accept("open",1500)!=0)throw new AssertionError("Burst arbitration");
  System.out.println("PASS: six gentle background palettes, bounded peaks/durations and liquidation-first burst priority.");
 }
}

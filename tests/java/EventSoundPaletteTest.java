import com.twintrade.app.EventSoundPalette;import java.util.*;
public class EventSoundPaletteTest {
 public static void main(String[] args){Set<String> signatures=new HashSet<>();for(String action:new String[]{"open","close","liq"})for(boolean side:new boolean[]{true,false}){List<String> notes=new ArrayList<>();EventSoundPalette.play((f,d,t,g,w)->{if(g>.065||d>.18)throw new AssertionError("Cue is too sharp or long");if(!t.equals("warm")&&!t.equals("chime")&&!t.equals("sine"))throw new AssertionError("Harsh waveform");notes.add(f+":"+d+":"+t+":"+g+":"+w);},action,side);if(notes.size()!=3)throw new AssertionError("Cue must be a short three-note phrase");signatures.add(notes.toString());}
  if(signatures.size()!=6)throw new AssertionError("Side/action cues are not distinct");
  List<double[]> gentle=new ArrayList<>(),warm=new ArrayList<>(),minimal=new ArrayList<>();List<String> warmTypes=new ArrayList<>();
  EventSoundPalette.play((f,d,t,g,w)->gentle.add(new double[]{f,d,g,w}),"open",true,"gentle");
  EventSoundPalette.play((f,d,t,g,w)->{warm.add(new double[]{f,d,g,w});warmTypes.add(t);},"open",true,"warm");
  EventSoundPalette.play((f,d,t,g,w)->minimal.add(new double[]{f,d,g,w}),"open",true,"minimal");
  if(gentle.size()!=3||warm.size()!=3||minimal.size()!=2)throw new AssertionError("Profile phrase length");
  if(Math.abs(warm.get(0)[0]/gentle.get(0)[0]-.88)>.0001||warmTypes.stream().anyMatch("chime"::equals))throw new AssertionError("Warm profile transform");
  if(!(minimal.get(1)[3]<=.11&&minimal.get(0)[2]<gentle.get(0)[2]))throw new AssertionError("Minimal profile spacing/gain");
  if(!(EventSoundPalette.priority("liq")>EventSoundPalette.priority("close")&&EventSoundPalette.priority("close")>EventSoundPalette.priority("open")))throw new AssertionError("Burst priority");
  List<String> profit=new ArrayList<>(),loss=new ArrayList<>(),minimalProfit=new ArrayList<>();
  EventSoundPalette.play((f,d,t,g,w)->profit.add(f+":"+t+":"+w),"profit",true,"gentle");
  EventSoundPalette.play((f,d,t,g,w)->loss.add(f+":"+t+":"+w),"loss",true,"gentle");
  EventSoundPalette.play((f,d,t,g,w)->minimalProfit.add(f+":"+t+":"+w),"profit",true,"minimal");
  if(profit.size()!=2||loss.size()!=2||minimalProfit.size()!=2||profit.equals(loss))throw new AssertionError("Distinct two-note P&L crossing cues");
  EventSoundPalette.BurstGate gate=new EventSoundPalette.BurstGate();if(gate.accept("open",1000)!=0||gate.accept("open",1100)!=-1||gate.accept("close",1150)!=1||gate.accept("open",1200)!=-1||gate.accept("open",1500)!=0)throw new AssertionError("Burst arbitration");
  List<Double> buzzer=new ArrayList<>(),win=new ArrayList<>(),lose=new ArrayList<>();
  EventSoundPalette.settlement((f,d,t,g,w)->{if(!"buzzer".equals(t)||g<=.2)throw new AssertionError("Liquidation peak");buzzer.add(f);},"liq",true,-10);
  EventSoundPalette.settlement((f,d,t,g,w)->win.add(f),"close",false,1);
  EventSoundPalette.settlement((f,d,t,g,w)->lose.add(f),"close",false,-1);
  if(buzzer.size()!=2||buzzer.get(0)<=buzzer.get(1)||win.size()!=4||lose.size()!=1)throw new AssertionError("Settlement cues");
  System.out.println("PASS: six gentle background palettes, bounded peaks/durations and liquidation-first burst priority.");
 }
}

import com.twintrade.app.CandleSound;
import java.util.ArrayList;
import java.util.List;

public class CandleSoundTest {
 public static void main(String[] args) {
  check(-1,-10,true);
  check(1,-10,false);
  check(1,10,true);
  check(-1,10,false);
  check(1,0,true);
  System.out.println("PASS: candle phrases match net position direction and respect volume.");
 }

 private static void check(double move,double exposure,boolean favorable) {
  List<Double> frequencies=new ArrayList<>();
  List<String> timbres=new ArrayList<>();
  CandleSound.play((f,d,t,g,w)->{
   if(g>.052*.45||f<220||f>700)throw new AssertionError("Candle sound outside gentle bounds");
   frequencies.add(f);
   timbres.add(t);
  },move,exposure,.45);
  if(frequencies.size()!=2||(frequencies.get(1)>frequencies.get(0))!=favorable||
     !timbres.get(1).equals(favorable?"chime":"warm"))throw new AssertionError("Incorrect exposure direction");
 }
}

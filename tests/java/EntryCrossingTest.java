import com.twintrade.app.EntryCrossing;
public class EntryCrossingTest {
 public static void main(String[] args){
  if(EntryCrossing.outcome(100,true,99,101)!=1)throw new AssertionError("Long profit crossing");
  if(EntryCrossing.outcome(100,true,101,99)!=-1)throw new AssertionError("Long loss crossing");
  if(EntryCrossing.outcome(100,false,101,99)!=1)throw new AssertionError("Short profit crossing");
  if(EntryCrossing.outcome(100,false,99,101)!=-1)throw new AssertionError("Short loss crossing");
  if(EntryCrossing.outcome(100,false,101,102)!=0||EntryCrossing.outcome(100,true,100,100)!=0)throw new AssertionError("Non-crossing move");
  System.out.println("PASS: entry crossings are classified by position profit/loss direction.");
 }
}

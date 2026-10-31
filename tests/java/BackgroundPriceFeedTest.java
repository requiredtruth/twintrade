import com.twintrade.app.BackgroundPriceFeed;
import java.util.*;

public class BackgroundPriceFeedTest {
 static void check(boolean b,String why){if(!b)throw new AssertionError(why);}
 static class Wire implements BackgroundPriceFeed.Transport {
  final BackgroundPriceFeed.Events events;boolean closed;
  Wire(BackgroundPriceFeed.Events events){this.events=events;}
  public void connect(){}
  public void close(){closed=true;events.failed();events.message("valid");}
 }
 public static void main(String[] args){
  long[] now={0};int[] accepted={0},opens={0};List<Wire> wires=new ArrayList<>();List<String> status=new ArrayList<>();
  BackgroundPriceFeed feed=new BackgroundPriceFeed(()->now[0],e->{Wire w=new Wire(e);wires.add(w);return w;},raw->{if(!raw.equals("valid"))return 0;accepted[0]++;return 1;},status::add,()->opens[0]++);
  feed.poll();Wire first=wires.get(0);first.events.open();
  now[0]=19000;first.events.message("heartbeat");feed.poll();check(wires.size()==1,"Handshake gets 20 seconds");
  now[0]=20000;feed.poll();check(first.closed,"Heartbeats cannot hide absence of usable prices");check(accepted[0]==0,"Synchronous close messages are obsolete");
  now[0]=20999;feed.poll();check(wires.size()==1,"Outage backoff");
  now[0]=21000;feed.poll();Wire second=wires.get(1);
  first.events.open();first.events.failed();first.events.message("valid");check(opens[0]==1&&accepted[0]==0,"Obsolete callbacks cannot change current state");
  second.events.open();now[0]=22000;second.events.message("valid");
  now[0]=41000;feed.poll();check(!second.closed,"Accepted quotes extend watchdog");
  now[0]=42000;feed.poll();check(second.closed,"Silent open socket expires");
  now[0]=43000;feed.poll();check(wires.size()==3,"Valid quotes reset outage backoff");
  Wire third=wires.get(2);third.events.message("valid");third.events.failed();third.events.failed();
  now[0]=43999;feed.poll();check(wires.size()==3,"Repeated close/error callbacks do not fork retries");
  now[0]=44000;feed.poll();check(wires.size()==4,"First failure retry");
  wires.get(3).events.failed();now[0]=45999;feed.poll();check(wires.size()==4,"Repeated failures back off exponentially");
  now[0]=46000;feed.poll();check(wires.size()==5,"Second failure retry");
  feed.reconnect();check(wires.size()==5,"Rapid manual reconnect is bounded");
  now[0]=47000;feed.reconnect();check(wires.size()==6,"Explicit recovery replaces transport");
  int before=accepted[0],states=status.size();feed.close();feed.close();
  wires.get(5).events.message("valid");now[0]=999999;feed.poll();feed.reconnect();
  check(wires.size()==6&&accepted[0]==before&&status.size()==states,"Stopping blocks all late work and restart callbacks");
  int[] attempts={0};BackgroundPriceFeed broken=new BackgroundPriceFeed(()->now[0],e->{attempts[0]++;throw new IllegalStateException();},raw->0,s->{},()->{});
  broken.poll();broken.poll();check(attempts[0]==1,"Constructor failure cannot spin");
  for(int n=0;n<12;n++){now[0]+=30000;broken.poll();}
  check(attempts[0]==13,"Retry backoff stays capped at 30 seconds");broken.close();
  System.out.println("PASS: background handshake/silence timeouts, usable-frame health, stale callbacks, outage backoff, manual recovery and stop.");
 }
}

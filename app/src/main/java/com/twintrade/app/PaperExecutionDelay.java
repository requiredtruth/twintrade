package com.twintrade.app;
import java.util.Random;
/** One-shot paper execution latency: 3-10 seconds, with an independent 5% 30-second tail. */
public final class PaperExecutionDelay {
 private static Random random=new Random();
 public static synchronized long sample(){return sample(random);}
 public static long sample(Random r){if(r.nextInt(20)==0)return 30000;return 3000+r.nextInt(7001);}
 public static synchronized void useRandomForTests(Random r){random=r==null?new Random():r;}
 private PaperExecutionDelay(){}
}

package com.twintrade.app;

/** Classifies a move through entry from the position owner's perspective. */
public final class EntryCrossing {
 private EntryCrossing(){}
 /** 1 = crossed into profit, -1 = crossed into loss, 0 = no crossing. */
 public static int outcome(double entry,boolean isLong,double previous,double next){
  if(!Double.isFinite(entry)||!Double.isFinite(previous)||!Double.isFinite(next)||entry<=0||previous==next)return 0;
  boolean crossed=previous<=entry&&next>entry||previous>=entry&&next<entry;
  if(!crossed)return 0;
  return ((next>entry)==isLong)?1:-1;
 }
}

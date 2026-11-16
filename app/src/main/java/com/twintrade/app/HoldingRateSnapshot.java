package com.twintrade.app;
import org.json.*;
/** Source-dated rates in percent/hour. V1 is already percent; V2/funding are fractions. */
public final class HoldingRateSnapshot {
 public static double[] parse(JSONObject response,long now)throws JSONException {
  Object rows=response.opt("holdingRates");if(rows==null)rows=response.opt("data");if(rows instanceof JSONObject){JSONObject data=(JSONObject)rows;rows=data.has("holdingRates")?data.opt("holdingRates"):data;}if(rows==null)rows=response.opt("rates");if(rows==null)rows=response;
  JSONObject r=rows instanceof JSONArray?((JSONArray)rows).getJSONObject(((JSONArray)rows).length()-1):(JSONObject)rows;
  long at=r.optLong("timestamp",0);if(at>0&&at<1000000000000L)at*=1000;if(at<=0||at>now+2000||now-at>=180000)throw new JSONException("Stale or missing holding source timestamp");
  double b=r.optDouble(r.has("borrowingFeeV2HourlyRate")?"borrowingFeeV2HourlyRate":"borrowingFeeHourlyRate",Double.NaN),fl=r.optDouble("fundingFeeLongHourlyRate",Double.NaN),fs=r.optDouble("fundingFeeShortHourlyRate",Double.NaN);
  boolean legacy=r.has("borrowingFeeV1LongHourlyRate")||r.has("borrowingFeeV1ShortHourlyRate");double bl=legacy?r.optDouble("borrowingFeeV1LongHourlyRate",Double.NaN):0,bs=legacy?r.optDouble("borrowingFeeV1ShortHourlyRate",Double.NaN):0;
  if(!Double.isFinite(b)||!Double.isFinite(fl)||!Double.isFinite(fs)||!Double.isFinite(bl)||!Double.isFinite(bs)||b<0||bl<0||bs<0)throw new JSONException("Incomplete holding rates");
  return new double[]{b*100+bl,b*100+bs,fl*100,fs*100};
 }
}

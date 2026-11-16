import com.twintrade.app.*;import org.json.*;
public class IntegrationRatesTest {
 public static void main(String[] args)throws Exception{
  if(BackgroundTrades.validFrame("{}")||BackgroundTrades.validFrame("garbage")||!BackgroundTrades.validFrame("{name:currentBlock,value:1}"))throw new AssertionError("Backend health requires valid events");
  long now=1800000000000L;JSONObject row=new JSONObject("{timestamp:1800000000,borrowingFeeV2HourlyRate:0.00001,borrowingFeeV1LongHourlyRate:0.003,borrowingFeeV1ShortHourlyRate:0.007,fundingFeeLongHourlyRate:0.00002,fundingFeeShortHourlyRate:-0.00004}");
  double[] rates=HoldingRateSnapshot.parse(new JSONObject().put("data",new JSONObject().put("holdingRates",new JSONArray().put(row))),now);
  if(Math.abs(rates[0]-.004)>1e-12||Math.abs(rates[1]-.008)>1e-12||rates[2]!=.002||rates[3]!=-.004)throw new AssertionError("Side-specific units");
  for(long stamp:new long[]{0,now-180000,now+2001}){row.put("timestamp",stamp);try{HoldingRateSnapshot.parse(row,now);throw new AssertionError("Accepted stale/future rates");}catch(JSONException expected){}}
  String p="https://api.gains.trade/v1/polygon/markets/BTC/candles";String first=GainsEndpoints.candidates(p,1000)[0];if(!first.contains(".dev"))throw new AssertionError("API primary");GainsEndpoints.failure(first,1000);if(!GainsEndpoints.candidates(p,1001)[0].contains(".trade"))throw new AssertionError("Fallback");if(!GainsEndpoints.candidates(p,61000)[0].contains(".dev"))throw new AssertionError("Recovery");
  try{GainsEndpoints.primary("https://gains.trade.evil.invalid");throw new AssertionError("Untrusted host");}catch(IllegalArgumentException expected){}
  System.out.println("PASS native source-date rejection, nested fee responses, side-specific units and endpoint failover/recovery");
 }
}

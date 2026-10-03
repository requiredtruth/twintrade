package com.twintrade.app;
import android.app.*;import android.os.*;import android.webkit.*;import android.view.*;import android.content.*;import android.security.keystore.*;import android.util.Base64;import java.security.*;import javax.crypto.*;import javax.crypto.spec.GCMParameterSpec;import java.io.*;
public class MainActivity extends Activity {
 private WebView web;
 @Override public void onCreate(Bundle state){super.onCreate(state);MarketStore.init(this);getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);getWindow().setStatusBarColor(0xff171e27);getWindow().setNavigationBarColor(0xff151c25);// Insets belong on the native parent: WebView padding does not reliably shrink its HTML viewport.
 if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false);
 else getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
 android.widget.FrameLayout safeArea = new android.widget.FrameLayout(this);
 safeArea.setBackgroundColor(0xff151c25);
 web=new WebView(this);
 safeArea.addView(web,new android.widget.FrameLayout.LayoutParams(android.widget.FrameLayout.LayoutParams.MATCH_PARENT,android.widget.FrameLayout.LayoutParams.MATCH_PARENT));
 setContentView(safeArea);
 safeArea.setOnApplyWindowInsetsListener((v,insets)->{
  if(Build.VERSION.SDK_INT>=30){
   android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
   android.graphics.Insets keyboard=insets.getInsets(WindowInsets.Type.ime());
   v.setPadding(bars.left,bars.top,bars.right,Math.max(bars.bottom,keyboard.bottom));
   return WindowInsets.CONSUMED;
  }
  v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
  return insets.consumeSystemWindowInsets();
 });
 safeArea.requestApplyInsets();WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);web.addJavascriptInterface(new Vault(),"Vault");web.addJavascriptInterface(new Feed(),"Feed");web.setWebChromeClient(new WebChromeClient(){@Override public boolean onJsConfirm(WebView v,String url,String message,JsResult result){new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("Confirm",(d,w)->result.confirm()).setNegativeButton("Cancel",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show();return true;}});web.setWebViewClient(new WebViewClient(){@Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){return true;}@Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest req){if(!"app.twintrade.local".equals(req.getUrl().getHost()))return null;try{String path=req.getUrl().getPath();if(path==null||path.equals("/"))path="/index.html";if(path.contains(".."))throw new IOException();String mime=path.endsWith(".js")?"application/javascript":path.endsWith(".css")?"text/css":"text/html";WebResourceResponse response=new WebResourceResponse(mime,"UTF-8",getAssets().open(path.substring(1)));java.util.Map<String,String> headers=new java.util.HashMap<>();headers.put("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src https: wss:; img-src 'self' data:; object-src 'none'; frame-src 'none'; base-uri 'none'");response.setResponseHeaders(headers);return response;}catch(Exception e){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",null,new ByteArrayInputStream(new byte[0]));}}});web.loadUrl("https://app.twintrade.local/index.html");
 if(getSharedPreferences("market",0).getBoolean("keepAlive",true))startForegroundService(new Intent(this,PriceMonitorService.class));
 if(Build.VERSION.SDK_INT>=33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS")!=android.content.pm.PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"},8);
}
 @Override public void onBackPressed(){web.evaluateJavascript("if(document.getElementById('config').open)document.getElementById('config').close();else {document.getElementById('drawer').hidden=true;document.getElementById('shade').hidden=true;}",null);}

 public class Feed {
  @JavascriptInterface public void updateCaps(String raw){MarketStore.updateCaps(raw);}
  @JavascriptInterface public void exitApp(){
   getSharedPreferences("market",0).edit().putBoolean("keepAlive",false).apply();
   stopService(new Intent(MainActivity.this,PriceMonitorService.class));
   runOnUiThread(()->{finishAndRemoveTask();new Handler().postDelayed(()->android.os.Process.killProcess(android.os.Process.myPid()),500);});
  }
  @JavascriptInterface public String snapshot(){return MarketStore.snapshot();}
  @JavascriptInterface public void seed(String raw){MarketStore.seed(raw);}
  @JavascriptInterface public String paper(){return MarketStore.book();}
  @JavascriptInterface public String open(int pair,boolean isLong,double percent,double lev,String cost){return MarketStore.open(pair,isLong,percent,lev,cost);}
  @JavascriptInterface public String close(String id){return MarketStore.close(id);}
  @JavascriptInterface public void reset(){MarketStore.reset();}
  @JavascriptInterface public void keepAlive(boolean enabled){getSharedPreferences("market",0).edit().putBoolean("keepAlive",enabled).apply();if(enabled)startForegroundService(new Intent(MainActivity.this,PriceMonitorService.class));else stopService(new Intent(MainActivity.this,PriceMonitorService.class));}
  @JavascriptInterface public void batterySettings(){runOnUiThread(()->{try{startActivity(new Intent(android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));}catch(Exception ignored){}});}
 }
 public class Vault {
 private SecretKey key()throws Exception{KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);if(!ks.containsAlias("TwinTradeWallet")){KeyGenerator g=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");g.init(new KeyGenParameterSpec.Builder("TwinTradeWallet",KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).setRandomizedEncryptionRequired(true).build());g.generateKey();}return (SecretKey)ks.getKey("TwinTradeWallet",null);}
 @JavascriptInterface public synchronized String save(String value){if(!value.matches("0x[0-9a-fA-F]{64}"))return "Invalid key";try{Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,key());String payload=Base64.encodeToString(c.getIV(),Base64.NO_WRAP)+":"+Base64.encodeToString(c.doFinal(value.getBytes("UTF-8")),Base64.NO_WRAP);return getSharedPreferences("vault",MODE_PRIVATE).edit().putString("wallet",payload).commit()?"OK":"Storage failed";}catch(Exception e){return "Key encryption failed";}}
 @JavascriptInterface public synchronized String load(){try{String s=getSharedPreferences("vault",MODE_PRIVATE).getString("wallet","");if(s.isEmpty())return "";String[] a=s.split(":");Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(a[0],Base64.NO_WRAP)));return new String(c.doFinal(Base64.decode(a[1],Base64.NO_WRAP)),"UTF-8");}catch(Exception e){return "";}}
 @JavascriptInterface public synchronized void forget(){getSharedPreferences("vault",MODE_PRIVATE).edit().clear().commit();try{KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);ks.deleteEntry("TwinTradeWallet");}catch(Exception ignored){}}
 }
}

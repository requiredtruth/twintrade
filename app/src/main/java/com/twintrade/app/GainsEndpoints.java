package com.twintrade.app;
import java.net.URI;import java.util.concurrent.ConcurrentHashMap;
/** Shared HTTPS/WSS health per service; Twintrade production backend routes first. GET/market feeds only. */
public final class GainsEndpoints {
 private static final ConcurrentHashMap<String,Long> failed=new ConcurrentHashMap<>();
 public static String primary(String url){URI u=URI.create(url);String h=u.getHost();if(h==null||!h.matches("(^|.*\\.)gains\\.(trade|dev)")||u.getUserInfo()!=null||!(u.getScheme().equals("https")||u.getScheme().equals("wss")))throw new IllegalArgumentException("Untrusted Gains endpoint");return withHost(url,h.replaceFirst("\\.(trade|dev)$",h.matches("api\\.gains\\.(trade|dev)")?".dev":".trade"));}
 private static String withHost(String url,String host){int start=url.indexOf("://")+3;String old=URI.create(url).getHost();return url.substring(0,start)+host+url.substring(start+old.length());}
 private static String key(String url){URI u=URI.create(primary(url));return u.getHost();}
 public static String secondary(String url){String p=primary(url);URI u=URI.create(p);return withHost(p,u.getHost().replaceFirst("\\.(trade|dev)$",u.getHost().endsWith(".dev")?".trade":".dev"));}
 public static String[] candidates(String url,long now){String p=primary(url),s=secondary(url);return now<failed.getOrDefault(key(url),0L)?new String[]{s,p}:new String[]{p,s};}
 public static void failure(String url,long now){if(URI.create(url).getHost().equals(URI.create(primary(url)).getHost()))failed.put(key(url),now+60000);}
 public static void success(String url){if(URI.create(url).getHost().equals(URI.create(primary(url)).getHost()))failed.remove(key(url));}
}

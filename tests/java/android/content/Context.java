package android.content;
import java.util.*;
public class Context {private final Map<String,String> data=new HashMap<>();public Context getApplicationContext(){return this;}public SharedPreferences getSharedPreferences(String name,int mode){return new SharedPreferences(){public String getString(String k,String d){return data.getOrDefault(k,d);}public Editor edit(){return new Editor(){public Editor putString(String k,String v){data.put(k,v);return this;}public boolean commit(){return true;}public void apply(){}};}};}}

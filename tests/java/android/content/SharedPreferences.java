package android.content;
public interface SharedPreferences {String getString(String key,String def);boolean getBoolean(String key,boolean def);Editor edit();interface Editor{Editor putString(String k,String v);boolean commit();void apply();}}

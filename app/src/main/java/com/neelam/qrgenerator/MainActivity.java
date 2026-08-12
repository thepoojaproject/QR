package com.neelam.qrgenerator;
import android.app.*; import android.os.*; import android.webkit.*; import android.view.*; import android.net.*; import android.content.*; import android.webkit.ValueCallback;

public class MainActivity extends Activity {
 WebView web; ValueCallback<Uri[]> uploadCallback;
 @Override public void onCreate(Bundle b){super.onCreate(b); web=new WebView(this); setContentView(web);
  WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true); s.setAllowContentAccess(true);
  web.setWebChromeClient(new WebChromeClient(){@Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> cb,FileChooserParams p){uploadCallback=cb;Intent i=p.createIntent();try{startActivityForResult(i,100);}catch(Exception e){return false;}return true;}});
  web.loadUrl("file:///android_asset/index.html");
 }
 @Override protected void onActivityResult(int r,int c,Intent d){super.onActivityResult(r,c,d);if(r==100&&uploadCallback!=null){uploadCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(c,d));uploadCallback=null;}}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
}
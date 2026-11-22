package com.qulqarni.reshimgath;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (this.bridge != null) {
            this.bridge.setWebViewClient(new BridgeWebViewClient(this.bridge) {
                private boolean handlePaymentUrl(Uri uri, String url) {
                    if (url == null) return false;
                    if (url.startsWith("upi:") || 
                        url.startsWith("gpay:") || 
                        url.startsWith("phonepe:") || 
                        url.startsWith("paytmmp:") || 
                        url.startsWith("bhim:") || 
                        url.startsWith("intent:")) {
                        try {
                            Intent intent;
                            if (url.startsWith("intent:")) {
                                intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                            } else {
                                intent = new Intent(Intent.ACTION_VIEW, uri != null ? uri : Uri.parse(url));
                            }
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                            return true;
                        } catch (ActivityNotFoundException e) {
                            Toast.makeText(MainActivity.this, "Please install Google Pay, PhonePe, or Paytm to pay via UPI.", Toast.LENGTH_SHORT).show();
                            return true;
                        } catch (Exception e) {
                            return true;
                        }
                    }
                    return false;
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri uri = request.getUrl();
                    String url = uri != null ? uri.toString() : "";
                    if (handlePaymentUrl(uri, url)) {
                        return true;
                    }
                    return super.shouldOverrideUrlLoading(view, request);
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (handlePaymentUrl(Uri.parse(url), url)) {
                        return true;
                    }
                    return super.shouldOverrideUrlLoading(view, url);
                }
            });
        }
    }
}

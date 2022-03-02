package org.jitsi.meet.sdk;

import android.app.Activity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;

import org.json.JSONObject;

public class SiccuraModule extends ReactContextBaseJavaModule {

    public SiccuraModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
    }

    @Override
    //getName is required to define the name of the module represented in JavaScript
    public String getName() {
        return "Siccura";
    }

    @ReactMethod
    public void callAction(String json,Callback errorCallback, Callback successCallback) {

        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
//            cancelCallback.invoke("Activity doesn't exist");
            return;
        }


        ((JitsiMeetActivity)currentActivity).sendAction(json);
        System.out.println(json);
        try {

            successCallback.invoke("Callback : Greetings from Java");
        } catch (IllegalViewOperationException e) {
            errorCallback.invoke(e.getMessage());
        }
    }
}
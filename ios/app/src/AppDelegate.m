/*
 * Copyright @ 2018-present 8x8, Inc.
 * Copyright @ 2017-2018 Atlassian Pty Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "AppDelegate.h"
#import "FIRUtilities.h"
#import "Types.h"
#import "ViewController.h"

@import Firebase;
@import JitsiMeetSDK;

@implementation AppDelegate

-             (BOOL)application:(UIApplication *)application
  didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    JitsiMeet *jitsiMeet = [JitsiMeet sharedInstance];
    jitsiMeet.conferenceActivityType = JitsiMeetConferenceActivityType;
    jitsiMeet.customUrlScheme = @"org.jitsi.meet";
    jitsiMeet.universalLinkDomains = @[@"meet.jit.si", @"alpha.jitsi.net", @"beta.meet.jit.si"];

    jitsiMeet.defaultConferenceOptions = [JitsiMeetConferenceOptions fromBuilder:^(JitsiMeetConferenceOptionsBuilder *builder) {
        [builder setFeatureFlag:@"welcomepage.enabled" withBoolean:YES];
        [builder setFeatureFlag:@"resolution" withValue:@(360)];
        builder.serverURL = [NSURL URLWithString:@"https://meet.jit.si"];
        builder.welcomePageEnabled = YES;
        builder.testStr = [self getTestString];
        // Apple rejected our app because they claim requiring a
        // Dropbox account for recording is not acceptable.
#if DEBUG
        [builder setFeatureFlag:@"ios.recording.enabled" withBoolean:YES];
#endif
    }];

  [jitsiMeet application:application didFinishLaunchingWithOptions:launchOptions];

    // Initialize Crashlytics and Firebase if a valid GoogleService-Info.plist file was provided.
  if ([FIRUtilities appContainsRealServiceInfoPlist]) {
        NSLog(@"Enabling Firebase");
        [FIRApp configure];
        // Crashlytics defaults to disabled wirth the FirebaseCrashlyticsCollectionEnabled Info.plist key.
        [[FIRCrashlytics crashlytics] setCrashlyticsCollectionEnabled:![jitsiMeet isCrashReportingDisabled]];
    }

    ViewController *rootController = (ViewController *)self.window.rootViewController;
    [jitsiMeet showSplashScreen:rootController.view];

    return YES;
}

-(NSString *)getTestString {
  @try {
    NSMutableDictionary *jsonDict = [NSMutableDictionary new];
    [jsonDict setValue:@"1" forKey:@"call_type"];
    [jsonDict setValue:@"madhav dixit" forKey:@"f_name"];
    [jsonDict setValue:@"Connecting" forKey:@"call_status"];
    [jsonDict setValue:@"voice call" forKey:@"call_category"];
    [jsonDict setValue:@"1" forKey:@"show_call_Screen"];
    [jsonDict setValue:@"data:image/png;base64,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" forKey:@"avatar"];

    NSString * jsonString = [self getJsonStringFromDict:jsonDict];

    return jsonString;
  } @catch(NSException *exception) {
    NSLog(@"Exception Occurred : %@",exception.description);
    return @"";
  }
}

-(NSString *)getJsonStringFromDict:(NSDictionary *)dict {
  @try {
    NSError * err = nil;
    NSData * jsonData = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&err];
    NSString * jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    return jsonString;
  } @catch(NSException *exception) {
    NSLog(@"Exception Occurred : %@",exception.description);
    return @"";
  }
}

- (void) applicationWillTerminate:(UIApplication *)application {
    NSLog(@"Application will terminate!");
    // Try to leave the current meeting graceefully.
    ViewController *rootController = (ViewController *)self.window.rootViewController;
    [rootController terminate];
}

#pragma mark Linking delegate methods

-    (BOOL)application:(UIApplication *)application
  continueUserActivity:(NSUserActivity *)userActivity
    restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> *restorableObjects))restorationHandler {

    if ([FIRUtilities appContainsRealServiceInfoPlist]) {
        // 1. Attempt to handle Universal Links through Firebase in order to support
        //    its Dynamic Links (which we utilize for the purposes of deferred deep
        //    linking).
        BOOL handled
          = [[FIRDynamicLinks dynamicLinks]
                handleUniversalLink:userActivity.webpageURL
                         completion:^(FIRDynamicLink * _Nullable dynamicLink, NSError * _Nullable error) {
           NSURL *firebaseUrl = [FIRUtilities extractURL:dynamicLink];
           if (firebaseUrl != nil) {
             userActivity.webpageURL = firebaseUrl;
             [[JitsiMeet sharedInstance] application:application
                                continueUserActivity:userActivity
                                  restorationHandler:restorationHandler];
           }
        }];

        if (handled) {
          return handled;
        }
    }

    // 2. Default to plain old, non-Firebase-assisted Universal Links.
    return [[JitsiMeet sharedInstance] application:application
                              continueUserActivity:userActivity
                                restorationHandler:restorationHandler];
}

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {

    // This shows up during a reload in development, skip it.
    // https://github.com/firebase/firebase-ios-sdk/issues/233
    if ([[url absoluteString] containsString:@"google/link/?dismiss=1&is_weak_match=1"]) {
        return NO;
    }

    NSURL *openUrl = url;

    if ([FIRUtilities appContainsRealServiceInfoPlist]) {
        // Process Firebase Dynamic Links
        FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];
        NSURL *firebaseUrl = [FIRUtilities extractURL:dynamicLink];
        if (firebaseUrl != nil) {
            openUrl = firebaseUrl;
        }
    }

    return [[JitsiMeet sharedInstance] application:app
                                           openURL:openUrl
                                           options:options];
}

@end

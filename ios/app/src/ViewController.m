/*
 * Copyright @ 2017-present 8x8, Inc.
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

@import CoreSpotlight;
@import MobileCoreServices;
@import Intents;  // Needed for NSUserActivity suggestedInvocationPhrase

@import JitsiMeetSDK;

#import "Types.h"
#import "ViewController.h"


@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

  _jitsiView = (JitsiMeetView *) self.view;
  _jitsiView.delegate = self;

    [_jitsiView join:[[JitsiMeet sharedInstance] getInitialConferenceOptions]];

  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(callActionNotification:)
                                               name:@"callActionNotification"
                                             object:nil];
}

-(void)callActionNotification:(id)response {
  NSLog(@"callActionNotification : %@",response);
  NSDictionary *tempDict = [NSDictionary dictionaryWithObjectsAndKeys:@"accepted",@"call_action", nil];
  [_jitsiView setCallData:[self getJsonStringFromDict:tempDict]];
  
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

// JitsiMeetViewDelegate

- (void)_onJitsiMeetViewDelegateEvent:(NSString *)name
                             withData:(NSDictionary *)data {
    NSLog(
        @"[%s:%d] JitsiMeetViewDelegate %@ %@",
        __FILE__, __LINE__, name, data);

#if DEBUG
    NSAssert(
        [NSThread isMainThread],
        @"JitsiMeetViewDelegate %@ method invoked on a non-main thread",
        name);
#endif
}

- (void)conferenceJoined:(NSDictionary *)data {
  NSDictionary *tempDict = [NSDictionary dictionaryWithObjectsAndKeys:@"calling",@"call_status", nil];
  [_jitsiView setCallStatus:[self getJsonStringFromDict:tempDict]];
    [self _onJitsiMeetViewDelegateEvent:@"CONFERENCE_JOINED" withData:data];

    // Register a NSUserActivity for this conference so it can be invoked as a
    // Siri shortcut.
    NSUserActivity *userActivity
      = [[NSUserActivity alloc] initWithActivityType:JitsiMeetConferenceActivityType];

    NSString *urlStr = data[@"url"];
    NSURL *url = [NSURL URLWithString:urlStr];
    NSString *conference = [url.pathComponents lastObject];

    userActivity.title = [NSString stringWithFormat:@"Join %@", conference];
    userActivity.suggestedInvocationPhrase = @"Join my Jitsi meeting";
    userActivity.userInfo = @{@"url": urlStr};
    [userActivity setEligibleForSearch:YES];
    [userActivity setEligibleForPrediction:YES];
    [userActivity setPersistentIdentifier:urlStr];

    // Subtitle
    CSSearchableItemAttributeSet *attributes
      = [[CSSearchableItemAttributeSet alloc] initWithItemContentType:(NSString *)kUTTypeItem];
    attributes.contentDescription = urlStr;
    userActivity.contentAttributeSet = attributes;

    self.userActivity = userActivity;
    [userActivity becomeCurrent];
}

- (void)conferenceTerminated:(NSDictionary *)data {
    [self _onJitsiMeetViewDelegateEvent:@"CONFERENCE_TERMINATED" withData:data];
}

- (void)conferenceWillJoin:(NSDictionary *)data {
    [self _onJitsiMeetViewDelegateEvent:@"CONFERENCE_WILL_JOIN" withData:data];
}

#if 0
- (void)enterPictureInPicture:(NSDictionary *)data {
    [self _onJitsiMeetViewDelegateEvent:@"ENTER_PICTURE_IN_PICTURE" withData:data];

}
#endif

- (void)participantJoined:(NSDictionary *)data {
  NSLog(@"%@%@", @"Participant joined: ", data[@"participantId"]);
}

- (void)participantLeft:(NSDictionary *)data {
  NSLog(@"%@%@", @"Participant left: ", data[@"participantId"]);
}

- (void)audioMutedChanged:(NSDictionary *)data {
  NSLog(@"%@%@", @"Audio muted changed: ", data[@"muted"]);
}

- (void)endpointTextMessageReceived:(NSDictionary *)data {
  NSLog(@"%@%@", @"Endpoint text message received: ", data);
}

- (void)screenShareToggled:(NSDictionary *)data {
  NSLog(@"%@%@", @"Screen share toggled: ", data);
}

- (void)chatMessageReceived:(NSDictionary *)data {
    NSLog(@"%@%@", @"Chat message received: ", data);
}

- (void)chatToggled:(NSDictionary *)data {
  NSLog(@"%@%@", @"Chat toggled: ", data);
}

- (void)videoMutedChanged:(NSDictionary *)data {
  NSLog(@"%@%@", @"Video muted changed: ", data[@"muted"]);
}

#pragma mark - Helpers

- (void)terminate {
    JitsiMeetView *view = (JitsiMeetView *) self.view;
    [view leave];
}

@end

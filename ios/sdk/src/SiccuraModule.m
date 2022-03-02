//
//  SiccuraModule.m
//  JitsiMeetSDK
//
//  Created by shahid on 4/7/21.
//  Copyright © 2021 Jitsi. All rights reserved.
//

// RCTCalendarModule.m
#import "SiccuraModule.h"

@implementation SiccuraModule
{
  bool hasListeners;
}

-(void)startObserving {
    hasListeners = YES;
    // Set up any upstream listeners or background tasks as necessary
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(setCallData:)
                                                 name:@"setCallData"
                                               object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(setCallStatus:)
                                                 name:@"setCallStatus"
                                               object:nil];
}

// Will be called when this module's last listener is removed, or on dealloc.
-(void)stopObserving {
    hasListeners = NO;
    // Remove upstream listeners, stop unnecessary background tasks
    
    [[NSNotificationCenter defaultCenter] removeObserver:self name:@"setCallData" object:nil];
}

// To export a module named RCTCalendarModule
//RCT_EXPORT_MODULE(Siccura);
RCT_EXPORT_MODULE(Siccura);

RCT_EXPORT_METHOD(callAction:(NSString *)json error:(RCTResponseSenderBlock)errorCallBack success:(RCTResponseSenderBlock)successCallBack)
{
    @try{
        NSString *callBackString = @"Callback : Greetings from Native Modules";
//        if ([self.delegate respondsToSelector:@selector(reactNativeBridgeCall:)]) {
//            [self.delegate reactNativeBridgeCall:callBackString];
//        }
        
        [[NSNotificationCenter defaultCenter] postNotificationName:@"callActionNotification" object:json];
        successCallBack(@[callBackString]);
     }
     @catch(NSException *exception){
         NSString *callBackString = @"Error From Native Module";
         errorCallBack(@[callBackString]);
     }
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"customEventName",@"CallStatusChangeEvent"];
}

-(void)setCallData:(NSNotification *)value {
    @try {
        NSString *jsonStr = [value object];
        NSLog(@"Value : %@",jsonStr);
        if (hasListeners) {
                   [self sendEventWithName:@"customEventName" body:jsonStr];
        }
    } @catch (NSException *exception) {
        NSLog(@"Exception Occurred : %@",exception.description);
    }
}

//{"call_status":"ringing"}
-(void)setCallStatus:(NSNotification *)value {
    @try {
        NSString *jsonStr = [value object];
        NSLog(@"Value : %@",jsonStr);
        if (hasListeners) {
                   [self sendEventWithName:@"CallStatusChangeEvent" body:jsonStr];
        }
    } @catch (NSException *exception) {
        NSLog(@"Exception Occurred : %@",exception.description);
    }
}
@end
//
//@interface Module : RCTEventEmitter <RCTBridgeModule>
//@end

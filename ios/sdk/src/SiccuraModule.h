//
//  RCTSiccuraModule.h
//  JitsiMeetSDK
//
//  Created by shahid on 4/7/21.
//  Copyright © 2021 Jitsi. All rights reserved.
//

#ifndef SiccuraModule_h
#define SiccuraModule_h

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface SiccuraModule : RCTEventEmitter <RCTBridgeModule>
-(void)setCallData:(NSString *)jsonStr;
-(void)setCallStatus:(NSNotification *)value;
@end

#endif /* SiccuraModule_h */

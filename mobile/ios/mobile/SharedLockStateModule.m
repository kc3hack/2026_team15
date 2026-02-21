#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharedLockStateModule, NSObject)

RCT_EXTERN_METHOD(saveLockState:(NSDictionary *)payload
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

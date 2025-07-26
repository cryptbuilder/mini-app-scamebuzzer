import { sdk } from '@farcaster/miniapp-sdk';

export const callReady = async (disableNativeGestures: boolean = false) => {
  try {
    console.log('Calling Farcaster SDK ready()');
    await sdk.actions.ready({ disableNativeGestures });
    console.log('Farcaster SDK ready() called successfully');
  } catch (error) {
    console.error('Error calling Farcaster SDK ready():', error);
  }
};

export const useFarcasterSDK = () => {
  return {
    sdk,
    callReady,
  };
}; 
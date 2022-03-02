/**
 * The prefix of the {@code localStorage} key into which {@link storeConfig}
 * stores and from which {@link restoreConfig} restores.
 *
 * @protected
 * @type string
 */
export const _CONFIG_STORE_PREFIX = 'config.js';

/**
 * The list of all possible UI buttons.
 *
 * @protected
 * @type Array<string>
 */
export const TOOLBAR_BUTTONS = [
    'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting', 'fullscreen',
    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
    'livestreaming', 'etherpad', 'sharedvideo', 'shareaudio', 'settings', 'raisehand',
    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
    'tileview', 'select-background', 'download', 'help', 'mute-everyone', 'mute-video-everyone',
    'security', 'toggle-camera'
];

/**
 * The toolbar buttons to show on premeeting screens.
 */
export const PREMEETING_BUTTONS = [ 'microphone', 'camera', 'select-background', 'invite', 'settings' ];

/**
  * The toolbar buttons to show on 3rdParty prejoin screen.
  */
export const THIRD_PARTY_PREJOIN_BUTTONS = [ 'microphone', 'camera', 'select-background' ];


/**
 * The set of feature flags.
 *
 * @enum {string}
 */

export const FEATURE_FLAGS = {
    SOURCE_NAME_SIGNALING: 'sourceNameSignaling'
};

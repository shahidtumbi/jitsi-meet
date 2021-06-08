// @flow

import React from 'react';
import { NativeModules, SafeAreaView, StatusBar, Text, NativeEventEmitter, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { appNavigate } from '../../../app/actions';
import { PIP_ENABLED, FULLSCREEN_ENABLED, getFeatureFlag } from '../../../base/flags';
import { Container, LoadingIndicator, TintedView } from '../../../base/react';
import { connect } from '../../../base/redux';
import { ASPECT_RATIO_NARROW } from '../../../base/responsive-ui/constants';
import { TestConnectionInfo } from '../../../base/testing';
import { ConferenceNotification, isCalendarEnabled } from '../../../calendar-sync';
import { Chat } from '../../../chat';
import { DisplayNameLabel } from '../../../display-name';
import { SharedDocument } from '../../../etherpad';
import {
    FILMSTRIP_SIZE,
    Filmstrip,
    isFilmstripVisible,
    TileView
} from '../../../filmstrip';
import { AddPeopleDialog, CalleeInfoContainer } from '../../../invite';
import { LargeVideo } from '../../../large-video';
import { KnockingParticipantList } from '../../../lobby';
import { BackButtonRegistry } from '../../../mobile/back-button';
import { Captions } from '../../../subtitles';
import { setToolboxVisible } from '../../../toolbox/actions';
import { Toolbox } from '../../../toolbox/components/native';
import { isToolboxVisible } from '../../../toolbox/functions';
import {
    AbstractConference,
    abstractMapStateToProps
} from '../AbstractConference';
import type { AbstractProps } from '../AbstractConference';

import LonelyMeetingExperience from './LonelyMeetingExperience';
import NavigationBar from './NavigationBar';
import CallingPage from './callingPage';
import OutGoingCall from './outGoingCall';
import styles, { NAVBAR_GRADIENT_COLORS } from './styles';

const Siccura = NativeModules.Siccura;
const eventEmitter = new NativeEventEmitter(Siccura);

/**
 * The type of the React {@code Component} props of {@link Conference}.
 */
type Props = AbstractProps & {

    /**
     * Application's aspect ratio.
     */
    _aspectRatio: Symbol,

    /**
     * Wherther the calendar feature is enabled or not.
     */
    _calendarEnabled: boolean,

    /**
     * The indicator which determines that we are still connecting to the
     * conference which includes establishing the XMPP connection and then
     * joining the room. If truthy, then an activity/loading indicator will be
     * rendered.
     */
    _connecting: boolean,

    /**
     * Set to {@code true} when the filmstrip is currently visible.
     */
    _filmstripVisible: boolean,

    /**
     * The indicator which determines whether fullscreen (immersive) mode is enabled.
     */
    _fullscreenEnabled: boolean,

    /**
     * The ID of the participant currently on stage (if any)
     */
    _largeVideoParticipantId: string,

    /**
     * Whether Picture-in-Picture is enabled.
     */
    _pictureInPictureEnabled: boolean,

    /**
     * The indicator which determines whether the UI is reduced (to accommodate
     * smaller display areas).
     */
    _reducedUI: boolean,

    /**
     * The indicator which determines whether the Toolbox is visible.
     */
    _toolboxVisible: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,
	conference: any
};

/**
 * The conference page of the mobile (i.e. React Native) application.
 */
class Conference extends AbstractConference<Props, *> {
    /**
     * Initializes a new Conference instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);
        this.state = { ActionCalling: false,
            callStatus: this.props._callData.call_status };

        // Bind event handlers so they are only bound once per instance.
        this._onClick = this._onClick.bind(this);
        this._onHardwareBackPress = this._onHardwareBackPress.bind(this);
        this._setToolboxVisible = this._setToolboxVisible.bind(this);
    }

    /**
     * Implements {@link Component#componentDidMount()}. Invoked immediately
     * after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        BackButtonRegistry.addListener(this._onHardwareBackPress);
        eventEmitter.addListener('customEventName', event => {
            if (JSON.parse(event).call_action == 'accepted') {
                this.setState({ ActionCalling: true });
            }
        });
        eventEmitter.addListener('CallStatusChangeEvent', event => {

            this.setState({ callStatus: JSON.parse(event).call_status });

        });

    }

    /**
     * Implements {@link Component#componentWillUnmount()}. Invoked immediately
     * before this component is unmounted and destroyed. Disconnects the
     * conference described by the redux store/state.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        // Tear handling any hardware button presses for back navigation down.
        BackButtonRegistry.removeListener(this._onHardwareBackPress);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _fullscreenEnabled } = this.props;

        return (
            <Container style = { styles.conference }>
                <StatusBar
                    barStyle = 'light-content'
                    hidden = { _fullscreenEnabled }
                    translucent = { _fullscreenEnabled } />
                { this._renderContent() }
            </Container>
        );
    }

    _onClick: () => void;

    /**
     * Changes the value of the toolboxVisible state, thus allowing us to switch
     * between Toolbox and Filmstrip and change their visibility.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        this._setToolboxVisible(!this.props._toolboxVisible);
    }

    _onHardwareBackPress: () => boolean;

    /**
     * Handles a hardware button press for back navigation. Enters Picture-in-Picture mode
     * (if supported) or leaves the associated {@code Conference} otherwise.
     *
     * @returns {boolean} Exiting the app is undesired, so {@code true} is always returned.
     */
    _onHardwareBackPress() {
        let p;

        if (this.props._pictureInPictureEnabled) {
            const { PictureInPicture } = NativeModules;

            p = PictureInPicture.enterPictureInPicture();
        } else {
            p = Promise.reject(new Error('PiP not enabled'));
        }

        p.catch(() => {
            this.props.dispatch(appNavigate(undefined));
        });

        return true;
    }

    /**
     * Renders JitsiModals that are supposed to be on the conference screen.
     *
     * @returns {Array<ReactElement>}
     */
    _renderConferenceModals() {
        return [
            <AddPeopleDialog key = 'addPeopleDialog' />,
            <Chat key = 'chat' />,
            <SharedDocument key = 'sharedDocument' />
        ];
    }

    /**
     * Renders the conference notification badge if the feature is enabled.
     *
     * @private
     * @returns {React$Node}
     */
    _renderConferenceNotification() {
        const { _calendarEnabled, _reducedUI } = this.props;

        return (
            _calendarEnabled && !_reducedUI
                ? <ConferenceNotification />
                : undefined);
    }

    /**
     * Renders the content for the Conference container.
     *
     * @private
     * @returns {React$Element}
     */
    _renderContent() {
        const {
            _connecting,
            _largeVideoParticipantId,
            _reducedUI,
            _shouldDisplayTileView,
            _toolboxVisible,
            conference
        } = this.props;
        const showGradient = _toolboxVisible;

        const showJitsiPage = false;

        if (_reducedUI) {
            return this._renderContentForReducedUi();
        }

        // if (conference && conference.participants && Object.keys(conference.participants).length == 0 ){

        // }
        if (this.props._callData.show_call_Screen == '1') {
            if (this.props._callData.call_type == '0') {
            // parentReference = {(callingAction)=>callingAction ? this._setJitsiSccren(_connecting,_shouldDisplayTileView,_largeVideoParticipantId): ''}
                return (
                    this.state.ActionCalling ? this._setJitsiSccren(_connecting, _shouldDisplayTileView, _largeVideoParticipantId)
                        :				<CallingPage
                            fName = { this.props._callData.f_name }
                            callCategory = { this.props._callData.call_category }
                            parentReference = { callingAction => callingAction ? this.setState({ ActionCalling: callingAction }) : '' } />
                );
            } else if (this.props._callData.call_type == '1') {
                return (
                    this.state.ActionCalling ? this._setJitsiSccren(_connecting, _shouldDisplayTileView, _largeVideoParticipantId)
                        : <OutGoingCall
                            fName = { this.props._callData.f_name }
                            callCategory = { this.props._callData.call_category }
                            callStatus = { this.state.callStatus } />

                );
            }
        } else {
            return (
                this._setJitsiSccren(_connecting, _shouldDisplayTileView, _largeVideoParticipantId)
            );
        }


        // return (
        //     <>
        //         {/*
        //           * The LargeVideo is the lowermost stacking layer.
        //           */
        //             _shouldDisplayTileView
        //                 ? <TileView onClick = { this._onClick } />
        //                 : <LargeVideo onClick = { this._onClick } />
        //         }

        //         {/*
        //           * If there is a ringing call, show the callee's info.
        //           */
        //             <CalleeInfoContainer />
        //         }

        //         {/*
        //           * The activity/loading indicator goes above everything, except
        //           * the toolbox/toolbars and the dialogs.
        //           */
        //             _connecting
        //                 && <TintedView>
        //                     <LoadingIndicator />
        //                 </TintedView>
        //         }

        //         <SafeAreaView
        //             pointerEvents = 'box-none'
        //             style = { [styles.toolboxAndFilmstripContainer] }>
        //             <Labels />
        //             <Captions onPress = { this._onClick } />
        //             { _shouldDisplayTileView || <Container style = { styles.displayNameContainer }>
        //                 <DisplayNameLabel participantId = { _largeVideoParticipantId } />
        //             </Container> }

        //             <LonelyMeetingExperience />

        //             {/*
        //               * The Toolbox is in a stacking layer below the Filmstrip.
        //               */}
        //             <Toolbox />

        //             {/*
        //               * The Filmstrip is in a stacking layer above the
        //               * LargeVideo. The LargeVideo and the Filmstrip form what
        //               * the Web/React app calls "videospace". Presumably, the
        //               * name and grouping stem from the fact that these two
        //               * React Components depict the videos of the conference's
        //               * participants.
        //               */
        //                 _shouldDisplayTileView ? undefined : <Filmstrip />
        //             }
        //         </SafeAreaView>

        //         <SafeAreaView
        //             pointerEvents = 'box-none'
        //             style = { styles.navBarSafeView }>
        //             <NavigationBar />
        //             { this._renderNotificationsContainer() }
        //             <KnockingParticipantList />
        //         </SafeAreaView>

        //         <TestConnectionInfo />

        //         { this._renderConferenceNotification() }

        //         { this._renderConferenceModals() }
        //     </>
        // );
    }

    _setJitsiSccren(_connecting, _shouldDisplayTileView, _largeVideoParticipantId) {
        return (
            <>
                {/*
                  * The LargeVideo is the lowermost stacking layer.
                  */
                    _shouldDisplayTileView
                        ? <TileView onClick = { this._onClick } />
                        : <LargeVideo onClick = { this._onClick } />
                }

                {/*
                  * If there is a ringing call, show the callee's info.
                  */
                    <CalleeInfoContainer />
                }

                {/*
                  * The activity/loading indicator goes above everything, except
                  * the toolbox/toolbars and the dialogs.
                  */
                    _connecting
                        && <TintedView>
                            <LoadingIndicator />
                        </TintedView>
                }

                <View
                    pointerEvents = 'box-none'
                    style = { styles.toolboxAndFilmstripContainer }>

                    <Captions onPress = { this._onClick } />
                    { _shouldDisplayTileView || <Container style = { styles.displayNameContainer }>
                        <DisplayNameLabel participantId = { _largeVideoParticipantId } />
                    </Container> }

                    <LonelyMeetingExperience />

                    { _shouldDisplayTileView ? undefined : <Filmstrip /> }
                    <Toolbox />
                </View>

                <SafeAreaView
                    pointerEvents = 'box-none'
                    style = { styles.navBarSafeView }>
                    <NavigationBar />
                    { this._renderNotificationsContainer() }
                    <KnockingParticipantList />
                </SafeAreaView>

                <TestConnectionInfo />

                { }

                { this._renderConferenceModals() }
            </>
        );
    }

    /**
     * Renders the content for the Conference container when in "reduced UI" mode.
     *
     * @private
     * @returns {React$Element}
     */
    _renderContentForReducedUi() {
        const { _connecting } = this.props;

        return (
            <>
                <LargeVideo onClick = { this._onClick } />

                {
                    _connecting
                        && <TintedView>
                            <LoadingIndicator />
                        </TintedView>
                }
            </>
        );
    }

    /**
     * Renders a container for notifications to be displayed by the
     * base/notifications feature.
     *
     * @private
     * @returns {React$Element}
     */
    _renderNotificationsContainer() {
        const notificationsStyle = {};

        // In the landscape mode (wide) there's problem with notifications being
        // shadowed by the filmstrip rendered on the right. This makes the "x"
        // button not clickable. In order to avoid that a margin of the
        // filmstrip's size is added to the right.
        //
        // Pawel: after many attempts I failed to make notifications adjust to
        // their contents width because of column and rows being used in the
        // flex layout. The only option that seemed to limit the notification's
        // size was explicit 'width' value which is not better than the margin
        // added here.
        const { _aspectRatio, _filmstripVisible } = this.props;

        if (_filmstripVisible && _aspectRatio !== ASPECT_RATIO_NARROW) {
            notificationsStyle.marginRight = FILMSTRIP_SIZE;
        }

        return super.renderNotificationsContainer(
            {
                style: notificationsStyle
            }
        );
    }

    _setToolboxVisible: (boolean) => void;

    /**
     * Dispatches an action changing the visibility of the {@link Toolbox}.
     *
     * @private
     * @param {boolean} visible - Pass {@code true} to show the
     * {@code Toolbox} or {@code false} to hide it.
     * @returns {void}
     */
    _setToolboxVisible(visible) {
        this.props.dispatch(setToolboxVisible(visible));
    }
}

/**
 * Maps (parts of) the redux state to the associated {@code Conference}'s props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const { connecting, connection } = state['features/base/connection'];
    const {
        conference,
        joining,
        membersOnly,
        leaving
    } = state['features/base/conference'];
    const { aspectRatio, reducedUI } = state['features/base/responsive-ui'];

    // XXX There is a window of time between the successful establishment of the
    // XMPP connection and the subsequent commencement of joining the MUC during
    // which the app does not appear to be doing anything according to the redux
    // state. In order to not toggle the _connecting props during the window of
    // time in question, define _connecting as follows:
    // - the XMPP connection is connecting, or
    // - the XMPP connection is connected and the conference is joining, or
    // - the XMPP connection is connected and we have no conference yet, nor we
    //   are leaving one.
    const connecting_
        = connecting || (connection && (!membersOnly && (joining || (!conference && !leaving))));
    const { app } = state['features/base/app'];

    return {
        ...abstractMapStateToProps(state),
        _aspectRatio: aspectRatio,
        _calendarEnabled: isCalendarEnabled(state),
        _connecting: Boolean(connecting_),
        _filmstripVisible: isFilmstripVisible(state),
        _fullscreenEnabled: getFeatureFlag(state, FULLSCREEN_ENABLED, true),
        _largeVideoParticipantId: state['features/large-video'].participantId,
        _pictureInPictureEnabled: getFeatureFlag(state, PIP_ENABLED),
        _reducedUI: reducedUI,
        _toolboxVisible: isToolboxVisible(state),
        conference,
        _callData: JSON.parse(app.props.url.config.testStr)
    };
}

export default connect(_mapStateToProps)(Conference);

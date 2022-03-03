// @flow

import type { Dispatch } from 'redux';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { getFeatureFlag, INVITE_ENABLED } from '../../../../base/flags';
import { translate } from '../../../../base/i18n';
import { IconInviteMore } from '../../../../base/icons';
import { connect } from '../../../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../../../base/toolbox/components';
import { doInvitePeople } from '../../../actions.native';
const Siccura = NativeModules.Siccura;
const eventEmitter = new NativeEventEmitter(Siccura);
type Props = AbstractButtonProps & {

    /**
     * The Redux dispatch function.
     */
    dispatch: Dispatch<any>
};

/**
 * Implements an {@link AbstractButton} to enter add/invite people to the
 * current call/conference/meeting.
 */
class InviteButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.shareRoom';
    icon = IconAddPeople;
    label = 'Participant';

    /**
     * Handles clicking / pressing the button, and opens the appropriate dialog.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        //this.props.dispatch(doInvitePeople());
        Siccura.callAction(
            			JSON.stringify({ call_Action: 'addParticipant' }),
            			(err) => {
            				console.log(err);
            			},
            			(msg) => {
            				console.log(`${msg}test`);
            			}
            		);
    }
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @param {Props} ownProps - The own props of the component.
 * @returns {Props}
 */
function _mapStateToProps(state, ownProps: Props) {
    const { disableInviteFunctions } = state['features/base/config'];
    const flag = getFeatureFlag(state, INVITE_ENABLED, true);

    return {
        visible: flag && !disableInviteFunctions && ownProps.visible
    };
}


export default translate(connect(_mapStateToProps)(InviteButton));

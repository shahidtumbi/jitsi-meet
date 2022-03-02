import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    SafeAreaView,
    Dimensions,
    NativeModules,
    TouchableOpacity,
    TouchableHighlight,
    NativeEventEmitter,
    ImageBackground
} from 'react-native';

import { DisplayNameLabel } from '../../../display-name';
const Siccura = NativeModules.Siccura;
const eventEmitter = new NativeEventEmitter(Siccura);
const CallingPage = props => {

    function sayHiFromJava(callAction) {
        console.log('parentReference', props.parentReference(callAction));
        Siccura.callAction(JSON.stringify({ 'call_Action': callAction }), err => {
            console.log(err);
        }, msg => {

            console.log(`${msg}test`);
        });

    }

    return (
        <View style = {{ flex: 2 }}>
            <ImageBackground
                style = { [ styles.backgroundImage ] }
                source = { require('../../../../../images/UI-Background-680x940.jpg') }>
                <View style = {{ flex: 1 }}>
                    <View style = {{ height: Dimensions.get('window').height / 2 }}>
                        <Image
                            style = { [ styles.avtarHeight, { margin: Dimensions.get('window').width / 10 } ] }
                            source = {{ uri: props.avatar }} />


                        <Text style = { [ styles.fonts, styles.paddingTop20 ] }>
                            {props.fName}
                        </Text>
                        <TouchableOpacity>
                            <Text style = { [ styles.fonts, styles.paddingTop50 ] }>
                                {`Incoming ${props.callCategory}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>


                <View
                    style = { [ { flex: 1,
                        flexDirection: 'row' } ] }>
                    <View
                        style = {{ flex: 3,
                            flexDirection: 'row' }}>
                        <View
                            style = {{ flex: 1,
                                justifyContent: 'center' }}>
                            <TouchableOpacity onPress = { () => sayHiFromJava('chat') }>

                                <Image
                                    style = { [ styles.imageHeight, { margin: 20 } ] }
                                    source = { require('../../../../../images/Message-icon.png') } />
                            </TouchableOpacity>
                        </View>
                        <View
                            style = {{ flex: 1,
                                justifyContent: 'center' }}>
                            <TouchableOpacity onPress = { () => sayHiFromJava('accept') } >

                                <Image
                                    style = { [ styles.imageHeight, { margin: 20 } ] }
                                    source = { require('../../../../../images/picking-call-icon.png') } />
                            </TouchableOpacity>
                        </View>
                        <View
                            style = {{ flex: 1,
                                justifyContent: 'center' }}>
                            <TouchableOpacity onPress = { () => sayHiFromJava('reject') } >
                                <Image
                                    style = { [ styles.imageHeight, { margin: 20 } ] }
                                    source = { require('../../../../../images/cutting-call-icon.png') } />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>

        </View>

    );
};
const styles = StyleSheet.create({
    flex: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    fonts: {
        fontSize: 25,
        color: '#fff',
        textAlign: 'center'
    },
    paddingTop50: {
        paddingTop: 0
    },
    paddingTop20: {
        paddingTop: 0
    },
    imageHeight: {
        height: 80,
        width: 80

    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.7
    },
	 avtarHeight: {
		 height: 140,
        width: 140

    }


});

export default CallingPage;

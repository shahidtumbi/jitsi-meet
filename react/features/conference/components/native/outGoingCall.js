import React, { useEffect, useState } from 'react';
import {

    StyleSheet,
    View,
    Text,
    SafeAreaView,
    Image,
    Dimensions,
    TouchableOpacity,
    NativeModules,
    NativeEventEmitter,
    ImageBackground

} from 'react-native';

const Siccura = NativeModules.Siccura;
const eventEmitter = new NativeEventEmitter(Siccura);
const OutGoingCall = props => {

    function sayHiFromJava(callAction) {
        Siccura.callAction(JSON.stringify({ 'call_Action': callAction }), err => {
            console.log(err);
        }, msg => {

            console.log(msg);
        });

    }

    return (
        <SafeAreaView style = {{ flex: 2 }}>
            <ImageBackground
                style = { [ styles.backgroundImage ] }
                source = { require('../../../../../images/UI-Background-680x940.jpg') }>
                <View
                    style = {{ flex: 1 }}>
                    <View
                        style = {{ height: Dimensions.get('window').height / 2 }}>
                        <Image
                            style = { [ styles.avtarHeight, { margin: Dimensions.get('window').width / 10 } ] }
                            source = {{ uri: props.avatar }} />
                        <Text style = { [ styles.fonts, styles.paddingTop20 ] }>
                            {props.fName}
                        </Text>
                        <Text style = { [ styles.fonts, styles.paddingTop20 ] }>
                            {props.callStatus}
                        </Text>
                        <TouchableOpacity>
                            <Text style = { [ styles.fonts, styles.paddingTop50 ] }>
                                {`Outgoing ${props.callCategory}`}
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>


                <View
                    style = { [ { flex: 1,
                        flexDirection: 'row' } ] }>
                    <View
                        style = {{ flex: 2,
                            flexDirection: 'row' }}>

                        <View
                            style = {{ flex: 1,
                                justifyContent: 'center'
                            }}>
                            <TouchableOpacity onPress = { () => sayHiFromJava('chat') }>

                                <Image
                                    style = { [ styles.imageHeight, { margin: 50 } ] }
                                    source = { require('../../../../../images/Message-icon.png') } />
                            </TouchableOpacity>
                        </View>
                        <View
                            style = {{ flex: 1,
                                justifyContent: 'center'
                            }}>
                            <TouchableOpacity
                                onPress = { () => sayHiFromJava('reject') }>

                                <Image
                                    style = { [ styles.imageHeight, { margin: 50 } ] }
                                    source = { require('../../../../../images/cutting-call-icon.png') } />
                            </TouchableOpacity>
                        </View>


                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
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
    avtarHeight: {
		 height: 140,
        width: 140

    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.7
    }


});

export default OutGoingCall;

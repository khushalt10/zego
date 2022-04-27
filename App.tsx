/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {Component} from 'react';
import {
  Button,
  Permission,
  PermissionsAndroid,
  PermissionStatus,
  Platform,
  StyleSheet,
  Text,
  View,
  findNodeHandle,
  Image,
  TouchableOpacity,
} from 'react-native';

import ZegoExpressEngine, {
  ZegoTextureView,
  ZegoScenario,
  ZegoUpdateType,
} from 'zego-express-engine-reactnative';
import {ZegoExpressManager} from './ZegoExpressManager';

// Check if the specified permission has been granted
let grantedAudio: Promise<boolean>, grantedCamera: Promise<boolean>;
if (Platform.OS === 'android') {
  grantedAudio = PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );
  grantedCamera = PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
}

const now = new Date().getTime();
const config = {
  // Get your AppID from ZEGOCLOUD Console
  //[My Projects] : https://console.zegocloud.com/project
  appID: AppID,
  // Get your AppSign from ZEGOCLOUD Console
  // [My Projects -> project's Edit -> Basic Configurations -> AppSign] : https://console.zegocloud.com/project"
  appSign: AppSign,
  userID: 'rn_user_' + now,
  userName: 'rn_user_' + now,
  roomID: 'room_1234567890',
};

const generateToken = () => {
  // Obtain the token interface provided by the App Server
  return Promise.resolve({data: {token: ''}});
};

const styles = StyleSheet.create({
  // ZegoEasyExample
  homePage: {
    width: '100%',
    height: '100%',
  },
  callPage: {
    width: '100%',
    height: '100%',
  },
  showPage: {
    display: 'flex',
  },
  hidePage: {
    display: 'none',
  },
  showPreviewView: {
    display: 'flex',
    opacity: 1,
  },
  hidePreviewView: {
    display: 'none',
    opacity: 0,
  },
  showPlayView: {
    display: 'flex',
    opacity: 1,
  },
  hidePlayView: {
    display: 'none',
    opacity: 0,
  },
  logo: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    marginTop: '50%',
    marginBottom: 100,
  },
  joinRoomBtn: {
    width: '30%',
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  previewView: {
    width: '100%',
    height: '100%',
  },
  play: {
    height: '25%',
    width: '40%',
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
  },
  playView: {
    width: '100%',
    height: '100%',
  },
  btnCon: {
    width: '100%',
    position: 'absolute',
    display: 'flex',
    bottom: 40,
    zIndex: 3,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  phoneCon: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: 'red',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 10,
  },
  cameraCon: {
    width: 60,
    height: 60,
    borderRadius: 40,
    // backgroundColor: 'gainsboro',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 10,
  },
  micCon: {
    width: 60,
    height: 60,
    borderRadius: 40,
    // backgroundColor: 'gainsboro',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  phoneImage: {
    width: 35,
    height: 35,
  },
});

export default class App extends Component<{}> {
  zegoPreviewViewRef: React.RefObject<ZegoTextureView>;
  zegoPlayViewRef: React.RefObject<ZegoTextureView>;
  cameraEnable = true;
  micEnable = true;
  state = {
    showHomePage: true,
    showPreview: false,
    showPlay: false,
  };
  constructor(props: any) {
    super(props);
    this.zegoPreviewViewRef = React.createRef();
    this.zegoPlayViewRef = React.createRef();
  }
  // Initialize SDK
  initSDK = () => {
    console.warn('init SDK');
    const profile = {
      appID: config.appID,
      appSign: config.appSign,
      scenario: ZegoScenario.General,
    };
    ZegoExpressManager.createEngine(profile).then(async () => {
      // Android: Dynamically obtaining device permissions
      if (Platform.OS === 'android') {
        const permissions: Permission[] = [];
        try {
          const result1 = await grantedAudio;
          const result2 = await grantedCamera;
          if (!result1) {
            permissions.push(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
          }
          if (!result2) {
            permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
          }
        } catch (error) {
          permissions.push(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
        }
        PermissionsAndroid.requestMultiple(permissions).then(
          (data: {[key in Permission]: PermissionStatus}) => {
            console.warn('requestMultiple', data);
          },
        );
      }
      // Register callback
      ZegoExpressManager.instance().onRoomUserUpdate(
        (updateType: ZegoUpdateType, userList: string[], roomID: string) => {
          console.warn('out roomUserUpdate', updateType, userList, roomID);
          userList.forEach(userID => {
            if (updateType === ZegoUpdateType.Add) {
              this.setState({showPlay: true}, () => {
                ZegoExpressManager.instance().setRemoteVideoView(
                  userID,
                  findNodeHandle(this.zegoPlayViewRef.current) as number,
                );
              });
            } else {
              this.setState({showPlay: false});
            }
          });
        },
      );
      ZegoExpressManager.instance().onRoomUserDeviceUpdate(
        (updateType, userID, roomID) => {
          console.warn('out roomUserDeviceUpdate', updateType, userID, roomID);
        },
      );
      ZegoExpressManager.instance().onRoomTokenWillExpire(
        async (roomID: string, remainTimeInSecond: number) => {
          console.warn('out roomTokenWillExpire', roomID, remainTimeInSecond);
          const token = (await generateToken()).data.token;
          ZegoExpressEngine.instance().renewToken(roomID, token);
        },
      );
    });
  };

  // Join room
  joinRoom = async () => {
    const token = (await generateToken()).data.token;
    ZegoExpressManager.instance()
      .joinRoom(config.roomID, token, {
        userID: config.userID,
        userName: config.userName,
      })
      .then(result => {
        if (result) {
          console.warn('Login successful');
          this.setState(
            {
              showHomePage: false,
              showPreview: true,
            },
            () => {
              ZegoExpressManager.instance().setLocalVideoView(
                findNodeHandle(this.zegoPreviewViewRef.current) as number,
              );
            },
          );
        } else {
          console.error('Login failed');
        }
      })
      .catch(() => {
        console.error('Login failed');
      });
  };

  // Switch camera
  enableCamera = () => {
    ZegoExpressManager.instance()
      .enableCamera(!this.cameraEnable)
      .then(() => {
        this.cameraEnable = !this.cameraEnable;
        this.setState({
          showPreview: this.cameraEnable,
        });
      });
  };

  // Switch microphone
  enableMic = () => {
    ZegoExpressManager.instance()
      .enableMic(!this.micEnable)
      .then(() => {
        this.micEnable = !this.micEnable;
      });
  };

  // Leave room
  leaveRoom = () => {
    this.setState({
      showHomePage: true,
      showPreview: false,
      showPlay: false,
    });
    ZegoExpressManager.instance()
      .leaveRoom()
      .then(() => {
        console.warn('Leave successful');
      });
  };

  componentDidMount() {
    this.initSDK();
  }

  componentWillUnmount() {
    if (ZegoExpressEngine.instance()) {
      ZegoExpressEngine.destroyEngine();
    }
  }

  render() {
    return (
      <View>
        <View
          style={[
            styles.homePage,
            this.state.showHomePage ? styles.showPage : styles.hidePage,
          ]}>
          <Text style={styles.logo}>ZEGOCLOUD</Text>
          <View style={styles.joinRoomBtn}>
            <Button onPress={this.joinRoom.bind(this)} title="joinRoom" />
          </View>
        </View>
        <View
          style={[
            styles.callPage,
            this.state.showHomePage ? styles.hidePage : styles.showPage,
          ]}>
          <View
            style={[
              styles.preview,
              this.state.showPreview
                ? styles.showPreviewView
                : styles.hidePreviewView,
            ]}>
            <ZegoTextureView
              ref={this.zegoPreviewViewRef}
              // @ts-ignore
              style={styles.previewView}
            />
          </View>
          <View
            style={[
              styles.play,
              this.state.showPlay ? styles.showPlayView : styles.hidePlayView,
            ]}>
            <ZegoTextureView
              ref={this.zegoPlayViewRef}
              // @ts-ignore
              style={styles.playView}
            />
          </View>
          <View style={styles.btnCon}>
            <TouchableOpacity
              style={styles.micCon}
              onPress={this.enableMic.bind(this)}>
              <Image style={styles.image} source={require('./img/mic.png')} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.phoneCon}
              onPress={this.leaveRoom.bind(this)}>
              <Image
                style={styles.phoneImage}
                source={require('./img/phone.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraCon}
              onPress={this.enableCamera.bind(this)}>
              <Image
                style={styles.image}
                source={require('./img/camera.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

// export default App1;
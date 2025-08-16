import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  PanResponder,
  Text,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import {WebView} from 'react-native-webview';

const NAVBAR_HEIGHT = 50;
const NAVBAR_BOTTOM_OFFSET = 30;
const HIDE_OFFSET = NAVBAR_HEIGHT + NAVBAR_BOTTOM_OFFSET;

const WebComponent = () => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');

  const webViewRef = useRef(null);
  const navbarAnimatedValue = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) =>
      gestureState.dx > 10 && gestureState.moveX < 50,
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 50 && canGoBack) {
        webViewRef.current?.goBack();
      }
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.timing(navbarAnimatedValue, {
      toValue: scrollDirection === 'up' ? 0 : HIDE_OFFSET,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [scrollDirection]);

  const handleNavigationStateChange = navState =>
    setCanGoBack(navState.canGoBack);

  const handleError = e => setError(e.nativeEvent.description);

  const injectedJavaScript = `
    let lastScroll = 0;
    let ticking = false;
    function update() {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScroll && st > 50) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ dir: 'down', y: st }));
      } else if (st < lastScroll) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ dir: 'up', y: st }));
      }
      lastScroll = st <= 0 ? 0 : st;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    });
    true;
  `;

  const handleWebViewMessage = event => {
    try {
      const {dir, y} = JSON.parse(event.nativeEvent.data);
      if (dir !== scrollDirection) setScrollDirection(dir);
      setLastScrollY(y);
    } catch {}
  };

  const handleNavbarPress = type => {
    const paths = {
      home: 'https://traderbros.app',
      search: 'https://traderbros.app/search',
      cart: 'https://traderbros.app/cart',
    };
    webViewRef.current?.injectJavaScript(
      `window.location.href='${paths[type]}'`,
    );
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./traderbroslogo.png')} style={styles.logo} />
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <WebView
        ref={webViewRef}
        source={{uri: 'https://traderbros.app'}}
        style={styles.webview}
        cacheEnabled
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
        onError={handleError}
        onNavigationStateChange={handleNavigationStateChange}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A3971" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        renderError={errName => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Error loading content: {errName}
            </Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      />

      <Animated.View
        style={[
          styles.navbar,
          {transform: [{translateY: navbarAnimatedValue}]},
        ]}>
        {[
          {type: 'home', icon: require('./assets/grid.png')},
          {type: 'search', icon: require('./assets/search.png')},
          {type: 'cart', icon: require('./assets/shoppingCart.png')},
        ].map(({type, icon}) => (
          <TouchableOpacity
            key={type}
            style={styles.navItem}
            onPress={() => handleNavbarPress(type)}
            activeOpacity={0.7}>
            <Image source={icon} style={styles.navIcon} tintColor="#fff" />
            {/* <Text style={styles.navText}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text> */}
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0A3971',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {width: 200, height: 200, resizeMode: 'contain'},
  container: {flex: 1, backgroundColor: '#fff'},
  webview: {flex: 1},
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {marginTop: 10, color: '#0A3971'},
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {color: 'red', textAlign: 'center', marginVertical: 5},
  navbar: {
    position: 'absolute',
    bottom: NAVBAR_BOTTOM_OFFSET,
    left: 0,
    right: 0,
    height: NAVBAR_HEIGHT,
    backgroundColor: '#0A3971',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    elevation: 8,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
    borderRadius: 1000,
  },
  navItem: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  navIcon: {
    width: 20,
    height: 20,
    marginBottom: 2,
    resizeMode: 'contain',
  },
  navText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});

export default WebComponent;

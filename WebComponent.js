import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Linking,
  PanResponder,
  Image,
  Text,
} from 'react-native';
import {WebView} from 'react-native-webview';

const {height, width} = Dimensions.get('window');

const WebComponent = () => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.dx > 10 && gestureState.moveX < 50;
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 50 && canGoBack) {
        webViewRef.current?.goBack();
      }
    },
  });

  useEffect(() => {
    console.log('Component mounted');
    const timer = setTimeout(() => {
      console.log('Splash screen timer finished');
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleShouldStartLoadWithRequest = event => {
    console.log('Loading URL:', event.url);
    return true; // Always allow loading inside WebView
  };
  

  const handleNavigationStateChange = navState => {
    console.log('Navigation state:', navState);
    setCanGoBack(navState.canGoBack);
  };

  const handleError = syntheticEvent => {
    const {nativeEvent} = syntheticEvent;
    console.warn('WebView error:', nativeEvent);
    setError(nativeEvent.description);
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('./traderbroslogo.png')}
          style={styles.logo}
          onError={e =>
            console.log('Image loading error:', e.nativeEvent.error)
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <WebView
        ref={webViewRef}
        source={{uri: 'https://traderbros.app'}}
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={handleError}
        renderError={errorName => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Error loading content: {errorName}
            </Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            {/* <ActivityIndicator color="#0A3971" size="large" /> */}
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
      />
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
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Changed from red to white
    height: '100%',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    color: '#0A3971',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default WebComponent;

import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import WebComponent from './WebComponent';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <WebComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

#!/bin/bash

# Set Android environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Check if emulator is already running
if ! adb devices | grep -q "emulator"; then
  echo "Starting Android emulator..."
  
  # Get the first available emulator
  AVD_NAME=$($ANDROID_HOME/emulator/emulator -list-avds | head -n 1)
  
  if [ -z "$AVD_NAME" ]; then
    echo "No Android emulators found. Please create one using Android Studio."
    exit 1
  fi
  
  echo "Starting emulator: $AVD_NAME"
  $ANDROID_HOME/emulator/emulator -avd $AVD_NAME -no-snapshot-load &
  
  # Wait for emulator to boot completely
  echo "Waiting for emulator to boot..."
  MAX_RETRY=30
  RETRY=0
  while [ $RETRY -lt $MAX_RETRY ]; do
    BOOT_COMPLETED=$(adb shell getprop sys.boot_completed 2>/dev/null)
    if [ "$BOOT_COMPLETED" == "1" ]; then
      break
    fi
    sleep 2
    RETRY=$((RETRY+1))
    echo "Waiting for emulator to boot... ($RETRY/$MAX_RETRY)"
  done
  
  if [ $RETRY -eq $MAX_RETRY ]; then
    echo "Emulator boot timed out. Please try again or start the emulator manually."
    exit 1
  fi
  
  echo "Emulator is ready!"
fi

# Run the app
echo "Building and installing the app..."
npx react-native run-android

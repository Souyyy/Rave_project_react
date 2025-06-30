import { StyleSheet, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from "./components/HomeScreen";
import RecordScreen from "./components/RecordScreen";
import RaveScreen from "./components/RaveScreen";

import { Provider } from 'react-redux'
import { store } from './redux/store'

export default function App() {
  const Tab = createBottomTabNavigator();
  return (

    <Provider store={store}>
        <NavigationContainer>
          {/* On utilise le createBottomTabNavigator pour creer la navigation entre les deux screens */}
          <Tab.Navigator
            initialRouteName="RecordScreen"
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
              tabBarStyle: {
                
                
                
                paddingHorizontal: 10,
              }
              
            }}
          >
            {/* On ajoute le composant CameraScreen à la navigation */}
            <Tab.Screen name="HomeScreen" component={HomeScreen} options={{
              title: '', tabBarIcon: ({ focused }) => (
                <View style={styles.iconContainer}>
                  <Image
                            source={require('./assets/cadenas.png')}
                            style={[styles.iconImage, { height:28, width:28, resizeMode: 'contain' }]}
                        />
                </View>
              ),
            }}
            />

            <Tab.Screen name="RecordScreen" component={RecordScreen} options={{
              title: '', tabBarIcon: ({ focused }) => (
                <View style={styles.iconContainer}>
                  <Image
                            source={require('./assets/record.png')}
                            style={[styles.iconImage, { height:64, width:64, resizeMode: 'contain' }]}
                        />
                </View>
              ),
            }}
            />

            {/* On ajoute le composant GallerieScreen à la navigation */}
            <Tab.Screen name="RaveScreen" component={RaveScreen} options={{
              title: '', tabBarIcon: ({ focused }) => (
                <View style={styles.iconContainer}>
                  <Image
                            source={require('./assets/transfert.png')}
                            style={[styles.iconImage, { height:28, width:28, resizeMode: 'contain' }]}
                        />
                </View>
              ),
            }}
            />
          </Tab.Navigator>
        </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

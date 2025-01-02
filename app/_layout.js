import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaView} from "react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";

export default function Layout() {
    return (
        <>
        {/*<SafeAreaProvider>*/}
        {/*    <SafeAreaView className="flex-1">*/}
                <StatusBar style="auto"/>
                <Stack
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#032541',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                        contentStyle: {
                            backgroundColor: '#000',
                        },
                        animation: 'fade',
                        headerBackTitleVisible: false,
                    }}
                >
                    <Stack.Screen
                        name="index"
                        options={{
                            headerShown: false,
                            headerTransparent: true,
                        }}
                    />
                    <Stack.Screen
                        name="movie/[id]"
                        options={{
                            headerTitle: 'Detail Movie',
                            headerTransparent: true,
                        }}
                    />
                    <Stack.Screen
                        name="movies/[id]"
                        options={{
                            headerTitle: 'List Movies',
                            headerTransparent: true,
                        }}
                    />
                </Stack>
        {/*    </SafeAreaView>*/}
        {/*</SafeAreaProvider>*/}
        </>
    );
}
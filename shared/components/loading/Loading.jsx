import LottieView from "lottie-react-native";
import {StyleSheet, View} from "react-native";

function Loading() {
    return (
        <View style={styles.container}>
            <LottieView style={{
                width: 250,
                height: 250,
            }} source={require("../../../assets/lotties/loading.json")} autoPlay loop/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
})

export default Loading;
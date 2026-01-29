import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeRunAnywhere } from './src/ai/initialization';
import { COLORS, SIZES } from "./src/constants/theme";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
    const [isAIReady, setIsAIReady] = useState(false);
    const [aiError, setAIError] = useState(null);
    const [aiProgress, setAIProgress] = useState('Initializing...');

    useEffect(() => {
        const init = async () => {
            try {
                await initializeRunAnywhere(
                    (progress) => {
                        setAIProgress(progress);
                        console.log('AI Progress:', progress);
                    },
                    (error) => {
                        setAIError(error.message);
                        console.error('AI Error:', error);
                    }
                );
                setIsAIReady(true);
            } catch (error) {
                setAIError(error.message);
            }
        };

        init();
    }, []);

    if (!isAIReady) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                {aiError ? (
                    <Text style={styles.errorText}>{aiError}</Text>
                ) : (
                    <>
                        <Text style={styles.loadingTitle}>
                            Downloading AI Models...
                        </Text>
                        <Text style={styles.loadingText}>
                            {aiProgress}
                        </Text>
                        <Text style={styles.loadingHint}>
                            This only happens once. Models are cached for
                            offline use.
                        </Text>
                    </>
                )}
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <NavigationContainer>
                    <StatusBar style="auto" />
                    <AppNavigator />
                </NavigationContainer>
            </AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        padding: 20,
    },
    loadingTitle: {
        fontSize: SIZES.h3,
        fontWeight: "bold",
        color: COLORS.black,
        marginTop: 20,
        textAlign: "center",
    },
    loadingText: {
        fontSize: SIZES.body1,
        color: COLORS.black,
        marginTop: 12,
        textAlign: "center",
    },
    loadingHint: {
        fontSize: SIZES.body3,
        color: COLORS.darkGray,
        marginTop: 16,
        textAlign: "center",
        fontStyle: "italic",
    },
    errorText: {
        fontSize: SIZES.body1,
        color: COLORS.red,
        marginTop: 12,
        textAlign: "center",
    },
});
        fontSize: SIZES.body1,
        color: COLORS.black,
        marginTop: 12,
        textAlign: "center",
    },
    loadingSubtext: {
        fontSize: SIZES.body2,
        color: COLORS.darkGray,
        marginTop: 8,
        textAlign: "center",
    },
    loadingHint: {
        fontSize: SIZES.body3,
        color: COLORS.darkGray,
        marginTop: 16,
        textAlign: "center",
        fontStyle: "italic",
    },
});

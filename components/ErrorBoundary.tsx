// components/ErrorBoundary.tsx
import { Ionicons } from "@expo/vector-icons";
import { Component, ErrorInfo, ReactNode } from "react";
import {
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
interface Props {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
}
interface State {
    error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };
    static getDerivedStateFromError(error: Error): State {
        return { error };
    }
    componentDidCatch(error: Error, info: ErrorInfo) {
        if (__DEV__) {
            console.error("ErrorBoundary caught an error:", error, info.componentStack);
        }
        this.props.onError?.(error, info);
    }
    reset = () => {
        this.setState({ error: null });
    };
    render() {
        const { error } = this.state;
        if (error) {
            if (this.props.fallback) {
                return this.props.fallback(error, this.reset);
            }
            return <DefaultFallback error={error} onReset={this.reset} />;
        }
        return this.props.children;
    }
}
function DefaultFallback({
    error,
    onReset,
}: {
    error: Error;
    onReset: () => void;
}) {
    return (
        <View className="flex-1 bg-white items-center justify-center px-6">
            <View className="w-[88px] h-[88px] rounded-full bg-red-50 items-center justify-center mb-5">
                <Ionicons name="warning-outline" size={48} color="#dc2626" />
            </View>
            <Text className="text-lg font-bold text-slate-900 mb-2 text-center">
                Something went wrong
            </Text>
            <Text className="text-sm text-slate-500 text-center leading-5 mb-6">
                The app hit an unexpected error. You can try again, and if it keeps
                happening, let us know what you were doing.
            </Text>
            <TouchableOpacity
                className="flex-row items-center bg-indigo-600 px-12 py-5 rounded-xl"
                onPress={onReset}
                activeOpacity={0.85}
            >
                <Ionicons name="refresh" size={28} color="#fff" className="mr-1.5" />
                <Text className="text-white font-semibold text-sm">Try Again</Text>
            </TouchableOpacity>
            {__DEV__ ? (
                <ScrollView
                    className="mt-7 max-h-screen w-full bg-slate-900 rounded-xl"
                    contentContainerClassName="p-3"
                >
                    <Text className="text-red-300 font-bold text-xs mb-1.5">
                        {error.name}: {error.message}
                    </Text>
                    <Text
                        className="text-slate-300 text-[11px]"
                        style={{ fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }) }}
                    >
                        {error.stack}
                    </Text>
                </ScrollView>
            ) : null}
        </View>
    );
}
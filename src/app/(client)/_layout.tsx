
import { Stack, Redirect } from 'expo-router';
import { Text } from 'react-native';

import { WSProvider } from '~/context/WSContext';
import { useUser } from '~/context/UserContext';

const ClientLayout = () => {
    const { profile, isInitializing, isSignedIn } = useUser();
    console.log("client", profile?.role)

    if (isInitializing) {
        return <Text>Loading...</Text>;
    }

    if (!isSignedIn) {
        return <Redirect href="/sign" />;
    }

    if (profile?.role === "taxi") {
        return <Redirect href="taximap" />;
    }

    return (
        <WSProvider>
            <Stack screenOptions={{
                headerShown: false,
            }} />
        </WSProvider>
    );
};

export default ClientLayout;

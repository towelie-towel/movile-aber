
import { Stack, Redirect } from 'expo-router';
import { Text } from 'react-native';

import { WSProvider } from '~/context/WSContext';
import { useUser } from '~/context/UserContext';

const TaxiLayout = () => {
    const { profile, isInitializing, isSignedIn } = useUser();
    console.log("taxi", profile?.role)

    if (isInitializing) {
        return <Text>Loading...</Text>;
    }

    if (!isSignedIn) {
        return <Redirect href="/sign" />;
    }

    if (profile?.role === "client") {
        return <Redirect href="(client)" />;
    }

    return (
        <WSProvider>
            <Stack initialRouteName='/taximap' screenOptions={{
                headerShown: false,
            }} />
        </WSProvider>
    );
};

export default TaxiLayout;

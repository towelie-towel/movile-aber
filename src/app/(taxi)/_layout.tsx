
import { Stack, Redirect } from 'expo-router';
import { Text } from 'react-native';

import { WSProvider } from '~/context/client/WSContext';
import { useUser } from '~/context/UserContext';

const TaxiLayout = () => {
    const { user, isLoading, isSignedIn } = useUser();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!isSignedIn) {
        return <Redirect href="/sign" />;
    }

    if (user?.role === "client") {
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

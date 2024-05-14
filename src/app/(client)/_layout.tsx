
import { Stack, Redirect } from 'expo-router';
import { Text } from 'react-native';

import { WSProvider } from '~/context/client/WSContext';
import { useUser } from '~/context/UserContext';

const ClientLayout = () => {
    const { user, isLoading, isSignedIn } = useUser();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!isSignedIn) {
        return <Redirect href="/sign" />;
    }

    if (user?.role === "taxi") {
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

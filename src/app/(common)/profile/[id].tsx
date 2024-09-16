import { useLocalSearchParams } from 'expo-router';

import { MenuProvider } from '~/lib/react-native-popup-menu';
import PublicProfileScreen from "~/components/screen/PublicProfile";

const PublicProfile = () => {

    const { id } = useLocalSearchParams();

    return (
        <MenuProvider skipInstanceCheck>
            <PublicProfileScreen profileId={id as string} />
        </MenuProvider>
    );
};

export default PublicProfile;

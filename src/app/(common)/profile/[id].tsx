import { useLocalSearchParams } from 'expo-router';

import PublicProfileScreen from "~/components/screen/PublicProfile";

const PublicProfile = () => {

    const { id } = useLocalSearchParams();

    return (
        <PublicProfileScreen profileId={id as string} />
    );
};

export default PublicProfile;

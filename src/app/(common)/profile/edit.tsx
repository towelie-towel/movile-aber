
import { MenuProvider } from '~/lib/react-native-popup-menu';
import ProfileEditScreen from "~/components/screen/ProfileEdit";

const ProfileEdit = () => {

    return (
        <MenuProvider skipInstanceCheck>
            <ProfileEditScreen />
        </MenuProvider>
    );
};

export default ProfileEdit;

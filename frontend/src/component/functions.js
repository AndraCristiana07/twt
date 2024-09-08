
export default function Functions(props) {
    const fetchUserInfo = async (user_id) => {
        try {

            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/get_specific_user/${user_id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            });
            console.log(response.data);
            const fetchedProfileImage = response.data.profile_image;
            const fetchedHeaderImage = response.data.header_image;
            setProfileImageURL(fetchedProfileImage);
            setHeaderImageURL(fetchedHeaderImage);
            setUsername(response.data.username);
        } catch (error) {
            console.log(error);
        }

    } 
} 
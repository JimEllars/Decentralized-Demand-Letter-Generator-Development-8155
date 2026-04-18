export const useAuth = () => {
    // Mock userSession to demonstrate Passport Integration UI
    return {
        userSession: {
            id: 'usr_mock_12345',
            health_index: 35,
            is_partner: true
        }
    };
};

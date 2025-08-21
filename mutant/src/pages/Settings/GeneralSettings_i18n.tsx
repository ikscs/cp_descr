import { Typography, Box, Stack } from '@mui/material';
import { useUserfront } from '@userfront/react';
import LanguageSwitcher from '../../components/Shared/LanguageSwitcher';
import { ThemeToggleButton } from '../../components/Shared/ThemeToggleButton';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import ThemeSwitcher from '../../components/Shared/ThemeSwitcher';
import ThemeToggleButton2 from '../../components/themes/ThemeToggleButton2';
import UserfrontRoles from '../../components/Users/UserfrontRoles';
import { CustomerDetailsForm } from '../../components/Customer/CustomerDetailsForm_i18n';

const GeneralSettings = () => {
    const Userfront = useUserfront();
    const { t } = useTranslation();

    return (
        <Box p={2}>
            <Typography variant="h4">{t('generalSettings.title')}</Typography>
            
            <Stack direction="row" spacing={2} sx={{ marginBottom: 0, marginTop: 0 }}>
                <div style={{ marginBottom: 20, marginTop: 20 }}>
                    {/* The LanguageSwitcher component itself would likely handle its own translation for its internal text */}
                    <LanguageSwitcher sx={{ minWidth: 120 }} /> 
                </div>          

                {/* <div style={{ marginBottom: 20, marginTop: 20 }}>
                    <ThemeToggleButton key={i18n.language} />
                </div> */}
                <div style={{ marginBottom: 20, marginTop: 20 }}>
                    <ThemeSwitcher sx={{ minWidth: 120 }} />
                </div>          
                {/* <div style={{ marginBottom: 20, marginTop: 20 }}>
                    <ThemeToggleButton2 />
                </div>           */}
            </Stack>

            <CustomerDetailsForm />

            {Userfront.user && (
                <Box mt={4} p={2} border={1} borderColor="grey.300" borderRadius={2}>
                    <Typography variant="h5" mb={2}>{t('generalSettings.currentUserInfo')}</Typography>
                    <Typography><strong>{t('generalSettings.userId')}</strong> {Userfront.user.userId}</Typography>
                    <Typography><strong>{t('generalSettings.uuid')}</strong> {Userfront.user.userUuid}</Typography>
                    <Typography><strong>{t('generalSettings.email')}</strong> {Userfront.user.email}</Typography>
                    <Typography><strong>{t('generalSettings.firstName')}</strong> {Userfront.user.name}</Typography>
                    <Typography><strong>{t('generalSettings.lastName')}</strong> {Userfront.user.lastName}</Typography>
                    <Typography><strong>{t('generalSettings.username')}</strong> {Userfront.user.username}</Typography>
                    <Typography><strong>{t('generalSettings.emailVerified')}</strong> {Userfront.user.isEmailVerified ? t('generalSettings.yes') : t('generalSettings.no')}</Typography>
                    <Typography><strong>{t('generalSettings.createdAt')}</strong> {new Date(Userfront.user.createdAt).toLocaleString(i18n.language === 'uk' ? 'uk-UA' : 'en-US')}</Typography>
                    <Typography><strong>{t('generalSettings.updatedAt')}</strong> {new Date(Userfront.user.updatedAt).toLocaleString(i18n.language === 'uk' ? 'uk-UA' : 'en-US')}</Typography>

                    <Box mt={3}>
                        <Typography variant="h6">{t('generalSettings.allUserProperties')}</Typography>
                        {Object.keys(Userfront.user).map((key) => {
                            if (typeof Userfront.user[key] === 'function') {
                                return null; 
                            }
                            return (
                                <Typography key={key} sx={{ wordBreak: 'break-all' }}>
                                    <strong>{key}:</strong> {
                                        typeof Userfront.user[key] === 'object' && Userfront.user[key] !== null
                                            ? JSON.stringify(Userfront.user[key], null, 2)
                                            : String(Userfront.user[key])
                                    }
                                </Typography>
                            );
                        })}
                        <UserfrontRoles user={Userfront.user} />
                    </Box>
                </Box>
            )}          
        </Box>
    );
};

export default GeneralSettings;
import React, { useState } from "react";
import Userfront from "@userfront/core";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { tenantId } from "../../../globals_VITE";

// Инициализируем Userfront
Userfront.init(tenantId);

// Типы для состояния компонента
interface SignupState {
  email: string;
  accountName: string;
  password: string;
  passwordVerify: string;
}

// Компонент формы
const SignupForm: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<SignupState>({
    email: "",
    accountName: "",
    password: "",
    passwordVerify: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordVerify, setShowPasswordVerify] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleClickShowPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowPassword((show) => !show);
    event.currentTarget.blur();
  }

  const handleClickShowPasswordVerify = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowPasswordVerify((show) => !show);
    event.currentTarget.blur();
  }

  // Предотвращаем дефолтное поведение при нажатии на иконку
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Обработчик изменения полей
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    
    if (formData.password !== formData.passwordVerify) {
      setErrorMessage(t("SignupForm.PasswordsDoNotMatch"));
      return;
    }    

    try {
      const res = await Userfront.signup({
        method: "password",
        email: formData.email,
        password: formData.password,
        data: {
          accountName: formData.accountName,
        },
      });
      console.log('res',res);
    } catch (error: any) {
      setErrorMessage(error.message || t("SignupForm.UnknownError"));
    }  
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2, // Отступ между элементами (1 = 8px)
        maxWidth: 400,
        mx: "auto", // Центрирование формы
        p: 3,
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <Typography variant="h4" component="h1" align="center">
        {t('SignupForm.SignUp')}
      </Typography>
      
      {errorMessage && (
        <Typography color="error" align="center" sx={{ mt: -1, mb: 1, fontWeight: "bold" }}>
          {errorMessage}
        </Typography>
      )}      
      
      <FormControl fullWidth>
        <TextField
          label={t('SignupForm.Email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </FormControl>

      <FormControl fullWidth>
        <TextField
          label={t('SignupForm.AccountName')}
          name="accountName"
          type="text"
          value={formData.accountName}
          onChange={handleInputChange}
        />
      </FormControl>

      <FormControl fullWidth>
        <TextField
          label={t('SignupForm.Password')}
          name="password"
          // Тип поля меняется в зависимости от showPassword
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleInputChange}
          required
          // Добавляем иконку
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FormControl>

      <FormControl fullWidth>
        <TextField
          // label="Verify password"
          label={t('SignupForm.VerifyPassword')}
          name="passwordVerify"
          // Тип поля меняется в зависимости от showPasswordVerify
          type={showPasswordVerify ? "text" : "password"}
          value={formData.passwordVerify}
          onChange={handleInputChange}
          required
          // Добавляем иконку
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPasswordVerify}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPasswordVerify ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FormControl>

      <Button type="submit" variant="contained">
        {/* Sign up */}
        {t('SignupForm.SignUp')}
      </Button>
    </Box>
  );
};

export default SignupForm;
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material';

const translations = {
  ua: {
    title: 'Тарифи: план для кожного',
    payYear: 'Оплата за рік',
    payMonth: 'за місяць',
    tariffs: [
      {
        icon: '🐅',
        name: 'Free',
        sites: '1 сайт',
        desc: '!Використовуй свою суперсилу з нашою колекцією ключових блоків',
        price: 'Безкоштовно',
        button: 'Створити сайт',
        extra: '',
        sub: '',
      },
      {
        icon: '🐆',
        name: 'Personal',
        sites: '1 сайт',
        desc: 'Повна колекція блоків, підключення свого домену та багато іншого. ',
        price: '200 грн./місяць',
        button: 'Створити сайт',
        extra: 'Повний список функцій.',
        sub: 'при оплаті за рік',
      },
      {
        icon: '🐘',
        name: 'Business',
        sites: '5 сайтів',
        desc: '+ Експорт вихідного коду',
        price: '400 грн./місяць',
        button: 'Створити сайт',
        extra: '',
        sub: 'при оплаті за рік',
      },
    ],
  },
  en: {
    title: 'Plans: a plan for everyone',
    payYear: 'Annual payment',
    payMonth: 'per month',
    tariffs: [
      {
        icon: '🐅',
        name: 'Free',
        sites: '1 site',
        desc: 'Use your superpower with our collection of key blocks',
        price: 'Free',
        button: 'Create site',
        extra: '',
        sub: '',
      },
      {
        icon: '🐆',
        name: 'Personal',
        sites: '1 site',
        desc: 'Full collection of blocks, custom domain connection and more. ',
        price: '200 UAH/month',
        button: 'Create site',
        extra: 'Full feature list.',
        sub: 'when paid annually',
      },
      {
        icon: '🐘',
        name: 'Business',
        sites: '5 sites',
        desc: '+ Source code export',
        price: '400 UAH/month',
        button: 'Create site',
        extra: '',
        sub: 'when paid annually',
      },
    ],
  },
};

const AdvertsView: React.FC = () => {
  const [paymentType, setPaymentType] = useState<'year' | 'month'>('year');
  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const t = translations[lang];

  return (
    <Box sx={{ p: 4 }}>
      {/* Переключатель языка */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <ToggleButtonGroup
          value={lang}
          exclusive
          onChange={(_, val) => val && setLang(val)}
          sx={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
        >
          <ToggleButton value="ua" sx={{ border: 'none', color: lang === 'ua' ? '#fff' : '#aaa', fontWeight: lang === 'ua' ? 600 : 400, fontSize: 16, background: 'transparent', borderBottom: lang === 'ua' ? '2px solid #fff' : '2px solid #444', borderRadius: 0, px: 2 }}>
            UA
          </ToggleButton>
          <ToggleButton value="en" sx={{ border: 'none', color: lang === 'en' ? '#fff' : '#aaa', fontWeight: lang === 'en' ? 600 : 400, fontSize: 16, background: 'transparent', borderBottom: lang === 'en' ? '2px solid #fff' : '2px solid #444', borderRadius: 0, px: 2 }}>
            EN
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {/* Блок тарифов */}
      <Typography variant="h3" align="center" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
        {t.title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <ToggleButtonGroup
          value={paymentType}
          exclusive
          onChange={(_, val) => val && setPaymentType(val)}
          sx={{ background: 'transparent', border: 'none' }}
        >
          <ToggleButton value="year" sx={{ border: 'none', color: paymentType === 'year' ? '#fff' : '#aaa', fontWeight: paymentType === 'year' ? 600 : 400, fontSize: 16, background: 'transparent', borderBottom: paymentType === 'year' ? '2px solid #fff' : '2px solid #444', borderRadius: 0, px: 3 }}>
            {t.payYear}
          </ToggleButton>
          <ToggleButton value="month" sx={{ border: 'none', color: paymentType === 'month' ? '#fff' : '#aaa', fontWeight: paymentType === 'month' ? 600 : 400, fontSize: 16, background: 'transparent', borderBottom: paymentType === 'month' ? '2px solid #fff' : '2px solid #444', borderRadius: 0, px: 3 }}>
            {t.payMonth}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mb: 6 }}>
        {t.tariffs.map((tariff, idx) => (
          <Paper key={tariff.name} sx={{ width: 300, minHeight: 420, p: 4, background: '#181a1b', border: '1px solid #bdbdbd', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: 90, height: 90, borderRadius: '50%', background: '#ffb199', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <span style={{ fontSize: 48 }}>{tariff.icon}</span>
            </Box>
            <Typography variant="h6" sx={{ color: '#fff', mb: 0.5 }}>{tariff.name}</Typography>
            <Typography sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>{tariff.sites}</Typography>
            <Typography align="center" sx={{ color: '#ccc', mb: 2 }}>
              {tariff.desc}
              {tariff.extra && <span style={{ color: '#ffb199', fontWeight: 600 }}>{tariff.extra}</span>}
            </Typography>
            <Typography sx={{ color: '#ffb199', fontWeight: 500, mb: 0.5 }}>{tariff.price}</Typography>
            {tariff.sub && <Typography sx={{ color: '#aaa', fontSize: 14, mb: 3 }}>{tariff.sub}</Typography>}
            <Button variant="contained" sx={{ background: '#232526', borderRadius: 20, px: 4, color: '#fff', mt: 'auto' }}>{tariff.button}</Button>
          </Paper>
        ))}
      </Box>
      {/* Конец блока тарифов */}
      <Typography variant="h4" gutterBottom>
        Размещение рекламы
      </Typography>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography>
          Здесь вы можете разместить свою рекламу или ознакомиться с предложениями.
        </Typography>
        {/* Здесь можно добавить форму или список объявлений */}
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Разместить объявление
        </Button>
      </Paper>
      {/* Пример блока для рекламы */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Рекламный блок 1</Typography>
        <Typography>Описание рекламного предложения...</Typography>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Рекламный блок 2</Typography>
        <Typography>Описание рекламного предложения...</Typography>
      </Paper>
    </Box>
  );
};

export default AdvertsView;
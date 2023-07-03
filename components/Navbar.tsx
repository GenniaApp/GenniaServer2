import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Chip from '@mui/material/Chip';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Modal from '@mui/material/Modal';

import { useState } from 'react';

// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Router from 'next/router';
import Image from 'next/image';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Link from 'next/link';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 'box-shadow: rgba(0, 0, 0, 0.8) 0px -1px 8px',
  p: 4,
};

const navItems = [
  { href: 'https://gennia.reqwey.com/', label: 'wiki' },
  { href: 'https://gennia.reqwey.com/bot-api/', label: 'bot-api' },
  { href: 'https://github.com/GenniaApp', label: 'about-us' },
];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);

  const { locale, locales, push } = useRouter();

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleClick = (l) => async () => {
    if (l == 'en') {
      push('/', undefined, { locale: l });
    } else {
      push('/', undefined, { locale: l });
      // todo: why we need reload?
      // await delay(1500);
      // Router.reload();
    }
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  return (
    <AppBar position='fixed' className='navbar'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size='large'
              aria-label='account of current user'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={handleOpenNavMenu}
              color='inherit'
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src='/img/favicon.png'
                width={32}
                height={32}
                alt='favicon'
              />
              <Typography variant='h6' sx={{ marginLeft: 1 }}>
                Gennia v1.0
              </Typography>
            </Box>
            <Menu
              id='menu-appbar'
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {navItems.map((item) => (
                <MenuItem key={item.href} onClick={handleCloseNavMenu}>
                  <Link href={item.href}>
                    <Typography textAlign='center'>{t(item.label)}</Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
            }}
          >
            <Link href='/'>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  src='/img/favicon.png'
                  width={32}
                  height={32}
                  alt='logo'
                />
                <Typography variant='h5' sx={{ marginLeft: 1, marginRight: 1 }}>
                  Gennia Online
                </Typography>
                <Chip label='beta' variant='outlined' color='warning' size='small' />
              </Box>
            </Link>

            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <Button
                  id='navbar-link'
                  onClick={handleCloseNavMenu}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {t(item.label)}
                </Button>
              </Link>
            ))}
          </Box>
          <Box
            id='lng-selector'
            sx={{ minWidth: 120, display: 'flex', justifyContent: 'right' }}
          >
            <FormControl>
              <Select
                color='secondary'
                className='navbar-language-switch'
                defaultValue={locale}
              >
                {locales.map((l) => (
                  <MenuItem key={l} value={l} onClick={handleClick(l)}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* 用户界面 todo */}
          {/* <Box sx={{ flexGrow: 0 }}>
            <Button
              id="navbar-link"
              variant="text"
              color="primary"
              sx={{ color: "white" }}
              onClick={handleOpen}
            >
              {" "}
              {t("navbar-link-clientzone")}{" "}
              <AccountCircleIcon sx={{ ml: 0.4 }} />
            </Button>
          </Box> */}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
/*
export async function getStaticProps(context) {
  // extract the locale identifier from the URL
  const { locale } = context;

  return {
    props: {
      // pass the translation props to the page component
      ...(await serverSideTranslations(locale)),
    },
  };
}
*/
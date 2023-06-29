import { Typography } from '@mui/material';


import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from 'next/link';
import { useRouter } from 'next/router';

import Router from "next/router";



function Footer() {
  const { t } = useTranslation();

  return (
    <>
      <div className='mini-footer-container'>
        <div className='mini-footer-content'>
          <Typography variant='subtitle' component='p'>
            Gennia App© {t("mini-footer-text")} <br></br>
          </Typography>
        </div>
      </div>
    </>
  );
}

export default Footer;

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

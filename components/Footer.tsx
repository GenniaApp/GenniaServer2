import { Typography } from '@mui/material';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Router from 'next/router';

function Footer() {
  const { t } = useTranslation();

  return (
    <div className='reqfooter'>
      <span style={{ paddingRight: 10, color: 'white' }}>
        {t('all-right-reserved')} © 2022~2023 Gennia &nbsp;
        {t('open-source-team')}
      </span>
      <a style={{ color: 'skyblue' }} href='https://beian.miit.gov.cn'>
        粤ICP备2022122081号-2
      </a>
    </div>
  );
}

export default Footer;

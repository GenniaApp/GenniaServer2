import { styled } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';

const FooterContainer = styled('div')`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100vw;
  height: max-content;
  bottom: 0;
  left: 0;
  z-index: 80;
  backdrop-filter: blur(3px);
  background-color: #212936 !important;
`;

function Footer() {
  const { t } = useTranslation();
  const chinaWebsite: boolean = process.env.NEXT_PUBLIC_SERVER_API.endsWith('cn');

  return (
    <FooterContainer>
      <div style={{ color: 'white' }}>
        {t('all-right-reserved')} © 2022~2023 Gennia &nbsp;
        {t('open-source-team')}
      </div>
      {
        chinaWebsite && <a style={{ color: 'skyblue' }} href='https://beian.miit.gov.cn'>
          粤ICP备2022122081号-2
        </a>
      }
    </FooterContainer>
  );
}

export default Footer;

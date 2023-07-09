import { styled } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';

const FooterContainer = styled('div')`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 50px;
  bottom: 0;
  left: 0;
  z-index: 80;
  background-color: rgb(89, 105, 117, 40%);
`;

function Footer() {
  const { t } = useTranslation();

  return (
    <FooterContainer>
      <div style={{ color: 'white' }}>
        {t('all-right-reserved')} © 2022~2023 Gennia &nbsp;
        {t('open-source-team')}
      </div>
      <a style={{ color: 'skyblue' }} href='https://beian.miit.gov.cn'>
        粤ICP备2022122081号-2
      </a>
    </FooterContainer>
  );
}

export default Footer;

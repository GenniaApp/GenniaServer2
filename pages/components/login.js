import { Box, Typography, Button, TextField } from "@mui/material";
import Image from "next/image";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import { useState } from "react";

function Login({ username, handlePlayClick }) {
  const { t } = useTranslation();
  const [inputname, setInputName] = useState(username);

  const handleUsernameChange = (event) => {
    setInputName(event.target.value);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "16vh",
        }}
      >
        <Image src="/img/favicon.png" width={100} height={100} alt="logo" />
        <Box
          className="menu-container"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: "80vw", md: "40vw" },
          }}
        >
          <Typography variant="h4" color="white" sx={{ padding: 4 }}>
            {t("welcome")}
          </Typography>
          <TextField
            id="outlined-basic"
            label="UserName"
            value={inputname}
            color="primary"
            focused
            variant="filled"
            onChange={handleUsernameChange}
          />
          {/* todo 临时解决 tailwindcss 和 mui 冲突 */}
          <Button
            className="bg-[#d24396]"
            variant="contained"
            onClick={() => handlePlayClick(inputname)}
            sx={{ margin: 2 }}
          >
            {t("play")}
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default Login;

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

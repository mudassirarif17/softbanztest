import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  Link,
  Tooltip,
  Typography,
  Container,
  Alert,
  styled,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";

import { useTranslation } from "react-i18next";
import Logo from "../../components/LogoSign";
import SuspenseLoader from "../../components/SuspenseLoader";

const icons = {
  Auth0: "/static/images/logo/auth0.svg",
  FirebaseAuth: "/static/images/logo/firebase.svg",
  JWT: "/static/images/logo/jwt.svg",
  Amplify: "/static/images/logo/amplify.svg",
};

const CardImg = styled(Card)(
  ({ theme }) => `
    width: 90px;
    height: 80px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: ${theme.colors.alpha.white[100]};
    margin: 0 ${theme.spacing(1)};
    border: 1px solid ${theme.colors.alpha.black[10]};
    transition: ${theme.transitions.create(["all"])};
    border-color: ${theme.colors.primary.main};
    &:hover {
      
    }
`
);

const BottomWrapper = styled(Box)(
  ({ theme }) => `
    padding: ${theme.spacing(3)};
    display: flex;
    align-items: center;
    justify-content: center;
`
);

const MainContent = styled(Box)(
  () => `
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
`
);

const TopWrapper = styled(Box)`
  display: flex;
  width: 100%;
  flex: 1;
  padding-top : 20px;
`;

function Login() {
  // const { method } = useAuth() as any;
  const { t }: { t: any } = useTranslation();

  return (
    <>
      {/* <Helmet>
        <title>Login - Basic</title>
      </Helmet> */}

      <MainContent>
        <TopWrapper>
          <Container maxWidth="sm">
            <Logo />
            <Card
              sx={{
                mt: 3,
                px: 4,
                pt: 5,
                pb: 3,
              }}
            >
              <Box>
                <Typography
                  variant="h2"
                  sx={{
                    mb: 1,
                  }}
                >
                  {t("Sign in")}
                </Typography>
                <Typography
                  variant="h4"
                  color="text.secondary"
                  fontWeight="normal"
                  sx={{
                    mb: 3,
                  }}
                >
                  {t("Fill in the fields below to sign into your account.")}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label={t("User Name")}
                placeholder={t("Your User Name here...")}
                margin="normal"
                name="email"
                type="email"
                variant="outlined"
              />
              <TextField
                fullWidth
                label={t("Password")}
                placeholder={t("Your password here...")}
                margin="normal"
                name="password"
                type="password"
                variant="outlined"
              />

              {/* <Box
              alignItems="center"
              display={{ xs: 'block', md: 'flex' }}
              justifyContent="space-between"
            >
              <Box display={{ xs: 'block', md: 'flex' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="terms"
                      color="primary"
                    />
                  }
                  label={
                    <>
                      <Typography variant="body2">
                        {t('I accept the')}{' '}
                        <Link component="a" href="#">
                          {t('terms and conditions')}
                        </Link>
                        .
                      </Typography>
                    </>
                  }
                />
              </Box>

              <Link component={RouterLink} to="/account/recover-password">
                <b>{t('Lost password?')}</b>
              </Link>

            </Box> */}

              <Button
                sx={{
                  mt: 3,
                }}
                color="primary"
                size="large"
                fullWidth
                type="submit"
                variant="contained"
              >
                {t("Sign in")}
              </Button>

              {/* <Box my={4}>
                <Typography
                  component="span"
                  variant="subtitle2"
                  color="text.primary"
                  fontWeight="bold"
                >
                  {t('Don’t have an account, yet?')}
                </Typography>{' '}

                <Link component={RouterLink} to="/account/register-basic">
                  <b>Sign up here</b>
                </Link>

              </Box> */}

              {/* <Tooltip
                  title={t('Used only for the live preview demonstration !')}
                >
                  <Alert severity="warning">
                    Use <b>demo@example.com</b> and password <b>TokyoPass1@</b>
                  </Alert>
                </Tooltip> */}

              <Alert severity="error" sx={{marginY : 4}}>
                {t(
                  "Learn how to switch between auth methods by reading the section we’ve prepared in the documentation."
                )}
              </Alert>
            </Card>

            {/* Icon Code */}
            {/* <BottomWrapper>
              <Tooltip arrow placement="top" title="Auth0">
                <CardImg>
                  <img height={50} alt="Auth0" src={icons['Auth0']} />
                </CardImg>
              </Tooltip>
              <Tooltip arrow placement="top" title="Firebase">
                <CardImg>
                  <img height={50} alt="Firebase" src={icons['FirebaseAuth']} />
                </CardImg>
              </Tooltip>
              <Tooltip arrow placement="top" title="JSON Web Token">
                <CardImg>
                  <img height={50} alt="JSON Web Token" src={icons['JWT']} />
                </CardImg>
              </Tooltip>
              <Tooltip arrow placement="top" title="Amplify">
                <CardImg>
                  <img height={50} alt="Amplify" src={icons['Amplify']} />
                </CardImg>
              </Tooltip>
            </BottomWrapper> */}
            
          </Container>
          
          {/* use it later  */}
          {/* <SuspenseLoader/> */}

        </TopWrapper>
      </MainContent>
    </>
  );
}

export default Login;

import { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import wait from '../../../src/utils/wait';
import { useLocation } from 'react-router-dom';

import {
  styled,
  Grid,
  Dialog,
  DialogTitle,
  Divider,
  Alert,
  DialogContent,
  Box,
  Zoom,
  ListItem,
  List,
  ListItemText,
  Typography,
  TextField,
  CircularProgress,
  Avatar,
  Button,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';

// import DatePicker from '@mui/lab/DatePicker';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import CloudUploadTwoToneIcon from '@mui/icons-material/CloudUploadTwoTone';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import { Link } from 'react-router-dom';

const BoxUploadWrapper = styled(Box)(
  ({ theme }) => `
    border-radius: ${theme.general.borderRadius};
    padding: ${theme.spacing(3)};
    background: ${theme.colors.alpha.black[5]};
    border: 1px dashed ${theme.colors.alpha.black[30]};
    outline: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: ${theme.transitions.create(['border', 'background'])};

    &:hover {
      background: ${theme.colors.alpha.white[100]};
      border-color: ${theme.colors.primary.main};
    }
`
);

// const EditorWrapper = styled(Box)(
//   ({ theme }) => `

//     .ql-editor {
//       min-height: 100px;
//     }

//     .ql-toolbar.ql-snow {
//       border-top-left-radius: ${theme.general.borderRadius};
//       border-top-right-radius: ${theme.general.borderRadius};
//     }

//     .ql-toolbar.ql-snow,
//     .ql-container.ql-snow {
//       border-color: ${theme.colors.alpha.black[30]};
//     }

//     .ql-container.ql-snow {
//       border-bottom-left-radius: ${theme.general.borderRadius};
//       border-bottom-right-radius: ${theme.general.borderRadius};
//     }

//     &:hover {
//       .ql-toolbar.ql-snow,
//       .ql-container.ql-snow {
//         border-color: ${theme.colors.alpha.black[50]};
//       }
//     }
// `
// );

const AvatarWrapper = styled(Avatar)(
  ({ theme }) => `
    background: ${theme.colors.primary.lighter};
    color: ${theme.colors.primary.main};
    width: ${theme.spacing(7)};
    height: ${theme.spacing(7)};
`
);

const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
    background: ${theme.colors.success.light};
    width: ${theme.spacing(7)};
    height: ${theme.spacing(7)};
`
);

const AvatarDanger = styled(Avatar)(
  ({ theme }) => `
    background: ${theme.colors.error.light};
    width: ${theme.spacing(7)};
    height: ${theme.spacing(7)};
`
);

// const projectTags = [
//   { title: 'Development' },
//   { title: 'Design Project' },
//   { title: 'Marketing Research' },
//   { title: 'Software' }
// ];


function PageHeader(props: any) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();


  // const members = [
  //   {
  //     avatar: '/static/images/avatars/1.jpg',
  //     name: 'Maren Lipshutz'
  //   },
  //   {
  //     avatar: '/static/images/avatars/2.jpg',
  //     name: 'Zain Vetrovs'
  //   },
  //   {
  //     avatar: '/static/images/avatars/3.jpg',
  //     name: 'Hanna Siphron'
  //   },
  //   {
  //     avatar: '/static/images/avatars/4.jpg',
  //     name: 'Cristofer Aminoff'
  //   },
  //   {
  //     avatar: '/static/images/avatars/5.jpg',
  //     name: 'Maria Calzoni'
  //   }
  // ];

  const {
    acceptedFiles,
    isDragActive,
    isDragAccept,
    isDragReject,
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg']
    }
  });

  const files = acceptedFiles.map((file, index) => (
    <ListItem disableGutters component="div" key={index}>
      <ListItemText primary={file.name} />
      <b>{file.size} bytes</b>
      <Divider />
    </ListItem>
  ));

  // const [value, setValue] = useState<Date | null>(null);

  const [tabs, setTabs] = useState<number>(0);

  const handleCreateProjectOpen = () => {
    setOpen(true);
  };

  const handleCreateProjectClose = () => {
    setOpen(false);
  };

  const handleCreateProjectSuccess = () => {
    enqueueSnackbar(t('A new project has been created successfully'), {
      variant: 'success',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right'
      },
      TransitionComponent: Zoom
    });

    setOpen(false);
  };

  const tabLabels = ["Patient", "Shared Patient"];
  const tabRoutes = ['/', '/shared_patient']; 
  const location = useLocation();

  const shouldShowButton = location.pathname !== '/shared_patient';

  return (
    <>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ marginBottom: '10px' }}>
          <Tabs value={tabs} onChange={(e, val) => setTabs(val)}>
            {tabLabels.map((label, index) => (
              <Tab  
              key={index}
              label={label}
              component={Link}
              to={tabRoutes[index]}
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            {props.title}
          </Typography>
          <Typography variant="subtitle2">
            {props.desc}
          </Typography>
        </Grid>
        <Grid item>
        {
  shouldShowButton && (
    <Button
      sx={{
        mt: { xs: 2, sm: 0 }
      }}
      onClick={handleCreateProjectOpen}
      variant="contained"
      startIcon={<AddTwoToneIcon fontSize="small" />}
    >
      {t('Add new patient')}
    </Button>
  )
}
          
        </Grid>
      </Grid>

      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        onClose={handleCreateProjectClose}
      >
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('Add new patient')}
          </Typography>
          <Typography variant="subtitle2">
            {t('Use this dialog window to add a new patient')}
          </Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            title: '',
            submit: null
          }}
          validationSchema={Yup.object().shape({
            title: Yup.string()
              .max(255)
              .required(t('The first name field is required'))
          })}
          onSubmit={async (
            _values,
            { resetForm, setErrors, setStatus, setSubmitting }
          ) => {
            try {
              await wait(1000);
              resetForm();
              setStatus({ success: true });
              setSubmitting(false);
              handleCreateProjectSuccess();
            } catch (err) {
              console.error(err);
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }}
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            touched,
            values
          }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent
                dividers
                sx={{
                  p: 3
                }}
              >
                <Grid container spacing={0}>

                  {/* Patient last name */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    justifyContent="flex-end"
                    textAlign={{ sm: 'right' }}
                  >
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('First Name')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <TextField
                      error={Boolean(touched.title && errors.title)}
                      fullWidth
                      helperText={touched.title && errors.title}
                      name="fname"
                      placeholder={t('Patient first name here...')}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Patient last name */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    justifyContent="flex-end"
                    textAlign={{ sm: 'right' }}
                  >
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Last Name')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <TextField
                      error={Boolean(touched.title && errors.title)}
                      fullWidth
                      helperText={touched.title && errors.title}
                      name="fname"
                      placeholder={t('Patient Last name here...')}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Patient date of birth */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    justifyContent="flex-end"
                    textAlign={{ sm: 'right' }}
                  >
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Date Of Birth')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <TextField
                      error={Boolean(touched.title && errors.title)}
                      fullWidth
                      helperText={touched.title && errors.title}
                      type='date'
                      name="dob"
                      placeholder={t('Patient Date Of Birth')}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Patient  Gender */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    justifyContent="flex-end"
                    textAlign={{ sm: 'right' }}
                  >
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Patient Gender')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <TextField
                      error={Boolean(touched.title && errors.title)}
                      fullWidth
                      helperText={touched.title && errors.title}
                      name="gender"
                      placeholder={t('Patient gender')}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Patient  Contact */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    justifyContent="flex-end"
                    textAlign={{ sm: 'right' }}
                  >
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Patient Contact')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <TextField
                      error={Boolean(touched.title && errors.title)}
                      fullWidth
                      helperText={touched.title && errors.title}
                      name="gender"
                      placeholder={t('Patient Contact')}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Patient  Email */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    justifyContent="flex-end"
                    textAlign={{ sm: 'right' }}
                  >
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Patient Email')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <TextField
                      error={Boolean(touched.title && errors.title)}
                      fullWidth
                      helperText={touched.title && errors.title}
                      name="email"
                      placeholder={t('Patient Email')}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Patient  Address */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    justifyContent="flex-end"
                    textAlign={{ sm: 'right' }}
                  >
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Patient Address')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <TextField
                      error={Boolean(touched.title && errors.title)}
                      fullWidth
                      helperText={touched.title && errors.title}
                      name="address"
                      placeholder={t('Patient address')}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Patient  Last visist */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    justifyContent="flex-end"
                    textAlign={{ sm: 'right' }}
                  >
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Patient last visit date')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <TextField
                      error={Boolean(touched.title && errors.title)}
                      fullWidth
                      type='date'
                      helperText={touched.title && errors.title}
                      name="address"
                      placeholder={t('Patient last visit date')}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Patient Condition */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    justifyContent="flex-end"
                    textAlign={{ sm: 'right' }}
                  >
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Patient Condition')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <TextField
                      error={Boolean(touched.title && errors.title)}
                      fullWidth
                      helperText={touched.title && errors.title}
                      name="address"
                      placeholder={t('Patient Condition')}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Patient Profile */}
                  <Grid item xs={12} sm={4} md={3} textAlign={{ sm: 'right' }}>
                    <Box
                      pr={3}
                      sx={{
                        pb: { xs: 1, md: 0 }
                      }}
                    >
                      <b>{t('Patient Profile Image')}:</b>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >
                    <BoxUploadWrapper {...getRootProps()}>
                      <input {...getInputProps()} />
                      {isDragAccept && (
                        <>
                          <AvatarSuccess variant="rounded">
                            <CheckTwoToneIcon />
                          </AvatarSuccess>
                          <Typography
                            sx={{
                              mt: 2
                            }}
                          >
                            {t('Drop the files to start uploading')}
                          </Typography>
                        </>
                      )}
                      {isDragReject && (
                        <>
                          <AvatarDanger variant="rounded">
                            <CloseTwoToneIcon />
                          </AvatarDanger>
                          <Typography
                            sx={{
                              mt: 2
                            }}
                          >
                            {t('You cannot upload these file types')}
                          </Typography>
                        </>
                      )}
                      {!isDragActive && (
                        <>
                          <AvatarWrapper variant="rounded">
                            <CloudUploadTwoToneIcon />
                          </AvatarWrapper>
                          <Typography
                            sx={{
                              mt: 2
                            }}
                          >
                            {t('Drag & drop files here')}
                          </Typography>
                        </>
                      )}
                    </BoxUploadWrapper>
                    {files.length > 0 && (
                      <>
                        <Alert
                          sx={{
                            py: 0,
                            mt: 2
                          }}
                          severity="success"
                        >
                          {t('You have uploaded')} <b>{files.length}</b>{' '}
                          {t('files')}!
                        </Alert>
                        <Divider
                          sx={{
                            mt: 2
                          }}
                        />
                        <List disablePadding component="div">
                          {files}
                        </List>
                      </>
                    )}
                  </Grid>

                  {/* Buttons */}
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`,
                      marginLeft: "30px"
                    }}
                    item
                    xs={12}
                    sm={8}
                    md={9}
                  >

                    <Button
                      sx={{
                        mr: 2
                      }}
                      type="submit"
                      startIcon={
                        isSubmitting ? <CircularProgress size="1rem" /> : null
                      }
                      disabled={Boolean(errors.submit) || isSubmitting}
                      variant="contained"
                      size="large"
                    >
                      {t('Add patient')}
                    </Button>

                    <Button
                      color="secondary"
                      size="large"
                      variant="outlined"
                      onClick={handleCreateProjectClose}
                    >
                      {t('Cancel')}
                    </Button>

                  </Grid>

                </Grid>

              </DialogContent>
            </form>
          )}
        </Formik>
      </Dialog>
      
    </>
  );
}

export default PageHeader;

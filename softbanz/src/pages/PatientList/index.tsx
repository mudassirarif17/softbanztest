import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import Home from '../Home/Home';

import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import Footer from '../../components/Footer';
import PageTitleWrapper from '../../components/PageTitleWrapper';

import { Grid } from '@mui/material';
import useRefMounted from '../../hooks/useRefMounted';
import type { Project } from '../../models/project';
import type { Patient } from '../../models/patients';

import Results from './Results';


function ManagementProjects(props:any) {
  const isMountedRef = useRefMounted();
  const [patients, setPatients] = useState<Patient[]>([]);

  const getPatients = useCallback(async () => {
    try {
      const response = await axios.get<{ patients: Patient[] }>(
        '/api/projects'
      );

      if (isMountedRef.current) {
        // setPatients(response.data.patients);
        setPatients([
          {
            "id" : "1",
            "firstname" : "Zafar",
            "lastname" : "Hassan",
            "dateofbirth" : "2001-02-14",
            "gender" : "male",
            "contact_number" : "03357486654",
            "email" : "zafar@aptechgdn.net",
            "address" : "Sadar karachi",
            "last_visit" : "2025-02-14",
            "condition" : "normal"
          }
        ])
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMountedRef]);

  useEffect(() => {
    // getProjects();
    getPatients();
  }, [getPatients]);

  return (
    <Home>
      {/* <Helmet>
        <title>Projects - Management</title>
      </Helmet> */}
      
      <PageTitleWrapper>
        <PageHeader title={props.title} desc={props.desc}/>
      </PageTitleWrapper>

      <Grid
        sx={{
          px: 4
        }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item xs={12}>
          <Results patient={patients} />
        </Grid>
      </Grid>
      <Footer />
    </Home>
  );
}

export default ManagementProjects;

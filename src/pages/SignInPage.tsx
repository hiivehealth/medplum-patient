// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { BackgroundImage, Box, SimpleGrid } from '@mantine/core';
import { SignInForm } from '@medplum/react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';
import { SystemUseNoticeGate } from '../components/SystemUseNoticeGate';

export function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  const clientId = import.meta.env.MEDPLUM_CLIENT_ID;
  const projectId = import.meta.env.MEDPLUM_PROJECT_ID;

  return (
    <SimpleGrid cols={2}>
      <Box pt={100} pb={200}>
        <SystemUseNoticeGate clientId={clientId} projectId={projectId}>
          <SignInForm
            projectId={projectId}
            googleClientId={import.meta.env.GOOGLE_CLIENT_ID}
            clientId={clientId}
            onSuccess={() => navigate('/')?.catch(console.error)}
          >
            <h2>Sign in to Foo Medical</h2>
          </SignInForm>
        </SystemUseNoticeGate>
      </Box>
      <BackgroundImage src="https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=1567&amp;q=80" />
    </SimpleGrid>
  );
}

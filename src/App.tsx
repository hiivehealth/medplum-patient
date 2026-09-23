// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { AppShell } from '@mantine/core';
import { ErrorBoundary, useMedplum } from '@medplum/react';
import { Suspense } from 'react';
import type { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Router } from './Router';
import { CuiBanner } from './components/CuiBanner/CuiBanner';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Loading } from './components/Loading';
import cuiShellClasses from './features/cui/CuiAppShell.module.css';
import { CuiPolicyProvider, useCuiPolicy } from './features/cui/CuiPolicyProvider';
import { RegisterPage } from './pages/RegisterPage';
import { SignInPage } from './pages/SignInPage';
import { LandingPage } from './pages/landing';

export function App(): JSX.Element | null {
  return (
    <CuiPolicyProvider>
      <AppContent />
    </CuiPolicyProvider>
  );
}

function AppContent(): JSX.Element | null {
  const medplum = useMedplum();
  const { state: cuiPolicy } = useCuiPolicy();

  if (medplum.isLoading()) {
    return null;
  }

  if (!medplum.getProfile()) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    );
  }

  const cuiEnabled =
    cuiPolicy.status === 'ready'
      ? cuiPolicy.policy.enabled
      : cuiPolicy.status === 'error'
        ? cuiPolicy.lastKnown?.enabled === true
        : false;

  return (
    <AppShell header={{ height: 80 }}>
      <Header />
      {cuiEnabled && (
        <div className={cuiShellClasses.banner}>
          <CuiBanner />
        </div>
      )}
      <AppShell.Main>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Router />
          </Suspense>
        </ErrorBoundary>
      </AppShell.Main>
      <Footer />
    </AppShell>
  );
}

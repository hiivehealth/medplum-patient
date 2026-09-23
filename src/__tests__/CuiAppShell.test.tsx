import { MantineProvider } from '@mantine/core';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { JSX, ReactNode } from 'react';
import { Link, MemoryRouter } from 'react-router';
import { App } from '../App';
import cuiShellClasses from '../features/cui/CuiAppShell.module.css';
import type { CuiPolicyState } from '../features/cui/CuiPolicyProvider';

const fixture = vi.hoisted(() => ({
  state: {
    status: 'ready',
    policy: {
      projectId: 'project-1',
      enabled: true,
      canManage: false,
      configurationId: 'cui-configuration',
    },
  } as CuiPolicyState,
}));

vi.mock('../features/cui/CuiPolicyProvider', () => ({
  CuiPolicyProvider: ({ children }: { children: ReactNode }) => children,
  useCuiPolicy: () => ({ state: fixture.state, refresh: vi.fn() }),
}));

vi.mock('../components/Header', () => ({ Header: () => <header>Patient header</header> }));
vi.mock('../components/Footer', () => ({ Footer: () => <footer>Patient footer</footer> }));
vi.mock('../pages/landing', () => ({ LandingPage: () => <div>Public landing</div> }));
vi.mock('../pages/SignInPage', () => ({ SignInPage: () => <div>Patient sign in</div> }));
vi.mock('../pages/RegisterPage', () => ({ RegisterPage: () => <div>Patient registration</div> }));
vi.mock('../Router', async () => {
  const { useLocation } = await import('react-router');
  return {
    Router: () => {
      const location = useLocation();
      return <div>Authenticated route: {location.pathname}</div>;
    },
  };
});

function RouteControls(): JSX.Element {
  return (
    <nav aria-label="Test routes">
      <Link to="/">Dashboard</Link>
      <Link to="/health-record">Health</Link>
      <Link to="/Communication">Messages</Link>
      <Link to="/account/profile">Account</Link>
    </nav>
  );
}

function setup(path: string, authenticated = true) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <RouteControls />
      <MedplumProvider medplum={new MockClient({ profile: authenticated ? HomerSimpson : null })}>
        <MantineProvider>
          <App />
        </MantineProvider>
      </MedplumProvider>
    </MemoryRouter>
  );
  return user;
}

beforeEach(() => {
  fixture.state = {
    status: 'ready',
    policy: {
      projectId: 'project-1',
      enabled: true,
      canManage: false,
      configurationId: 'cui-configuration',
    },
  };
});

test('mounts CUI between the patient header and main content for an enabled authenticated project', () => {
  setup('/health-record');

  const banner = screen.getByRole('complementary', { name: 'CUI' });
  const shell = banner.closest('.mantine-AppShell-root');
  expect(shell).not.toBeNull();
  expect(banner.parentElement).toHaveClass(cuiShellClasses.banner);
  expect(within(shell as HTMLElement).getByText('Patient header')).toBeVisible();
  expect(within(shell as HTMLElement).getByText('Authenticated route: /health-record')).toBeVisible();
  expect(within(shell as HTMLElement).getByText('Patient footer')).toBeVisible();
  expect(shell?.textContent).toBe('Patient headerCUIAuthenticated route: /health-recordPatient footer');
});

test('does not show CUI when the project policy is disabled', () => {
  fixture.state = {
    status: 'ready',
    policy: {
      projectId: 'project-1',
      enabled: false,
      canManage: false,
      configurationId: 'cui-configuration',
    },
  };
  setup('/');

  expect(screen.getByText('Authenticated route: /')).toBeVisible();
  expect(screen.queryByRole('complementary', { name: 'CUI' })).not.toBeInTheDocument();
});

test.each([
  ['/', 'Public landing'],
  ['/signin', 'Patient sign in'],
  ['/register', 'Patient registration'],
])('does not show CUI on unauthenticated route %s', (path, content) => {
  setup(path, false);

  expect(screen.getByText(content)).toBeVisible();
  expect(screen.queryByRole('complementary', { name: 'CUI' })).not.toBeInTheDocument();
});

test('retains the same banner across authenticated patient navigation', async () => {
  const user = setup('/');
  const banner = screen.getByRole('complementary', { name: 'CUI' });

  for (const [link, path] of [
    ['Health', '/health-record'],
    ['Messages', '/Communication'],
    ['Account', '/account/profile'],
    ['Dashboard', '/'],
  ]) {
    await user.click(screen.getByRole('link', { name: link }));
    expect(await screen.findByText(`Authenticated route: ${path}`)).toBeVisible();
    expect(screen.getByRole('complementary', { name: 'CUI' })).toBe(banner);
  }
});

test('retains the last confirmed enabled decision during a policy refresh error', () => {
  fixture.state = {
    status: 'error',
    projectId: 'project-1',
    error: 'Offline',
    lastKnown: {
      projectId: 'project-1',
      enabled: true,
      canManage: false,
      configurationId: 'cui-configuration',
    },
  };
  setup('/account/profile');

  expect(screen.getByRole('complementary', { name: 'CUI' })).toBeVisible();
});

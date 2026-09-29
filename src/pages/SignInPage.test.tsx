// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MantineProvider } from '@mantine/core';
import type { MedplumClient } from '@medplum/core';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { SignInPage } from './SignInPage';

function mockSystemUseNotice(client: MedplumClient, notice: unknown = { enabled: false }): void {
  const originalGet = client.get.bind(client);
  vi.spyOn(client, 'get').mockImplementation((url, options) => {
    if (String(url).includes('auth/system-use-notice')) {
      return Promise.resolve(notice) as ReturnType<MedplumClient['get']>;
    }
    return originalGet(url, options);
  });
}

describe('SignInPage', () => {
  function setup(notice: unknown = { enabled: false }): void {
    const client = new MockClient({ profile: null });
    mockSystemUseNotice(client, notice);
    render(
      <MemoryRouter>
        <MedplumProvider medplum={client}>
          <MantineProvider>
            <SignInPage />
          </MantineProvider>
        </MedplumProvider>
      </MemoryRouter>
    );
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Renders sign in form when notice is disabled', async () => {
    setup();

    expect(await screen.findByText('Sign in to Foo Medical')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  test('Shows system use notice before credentials', async () => {
    setup({
      enabled: true,
      version: 'usg-system-use-2026-09-10',
      title: 'U.S. Government System Use Acknowledgment',
      body: 'Approved notice text',
      actionLabel: 'OK',
    });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Approved notice text')).toBeInTheDocument();
    expect(screen.queryByText('Sign in to Foo Medical')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    });

    expect(await screen.findByText('Sign in to Foo Medical')).toBeInTheDocument();
  });
});

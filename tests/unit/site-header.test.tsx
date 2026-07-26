import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SiteHeader from '@/components/SiteHeader';

// SiteHeader calls usePathname(). Outside an App Router context that hook has
// no provider, so it must be mocked or every test in this file throws.
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('SiteHeader', () => {
  it('renders all five nav labels', () => {
    render(<SiteHeader />);
    for (const label of [
      'Strona główna',
      'Poznaj Hannę',
      'Usługi',
      'Partnerzy',
      'Bezpłatna konsultacja',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('toggles aria-expanded on the menu button', async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const button = screen.getByRole('button', { name: /menu/i });

    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('renames the toggle when the menu is open', async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    expect(screen.getByRole('button', { name: 'Otwórz menu' }));
    await user.click(screen.getByRole('button', { name: 'Otwórz menu' }));
    expect(screen.getByRole('button', { name: 'Zamknij menu' }));
  });

  it('marks the current page with aria-current', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('link', { name: 'Strona główna' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      screen.getByRole('link', { name: 'Poznaj Hannę' })
    ).not.toHaveAttribute('aria-current');
  });
});

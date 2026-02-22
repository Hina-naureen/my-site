/**
 * Dynamic navbar item: shows Sign Up / Sign In when logged out,
 * Profile / Sign Out when logged in.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import { useAuth } from './AuthContext';

interface Props {
  mobile?: boolean;
  onClick?: () => void;
}

export default function AuthNavbarItem({ mobile, onClick }: Props): React.JSX.Element | null {
  const { token, user, logout, isLoading } = useAuth();

  // Don't render during SSR/hydration to avoid mismatch flash
  if (isLoading) return null;

  const linkClass = mobile ? 'menu__link' : 'navbar__item navbar__link';

  if (token) {
    return (
      <>
        <Link
          to="/profile"
          className={linkClass}
          onClick={onClick}
        >
          {user?.name ?? 'Profile'}
        </Link>
        <button
          onClick={() => { logout(); onClick?.(); }}
          className={linkClass}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            font: 'inherit',
            color: 'inherit',
          }}
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        to="/signup"
        className={`${linkClass} navbar-signup-btn`}
        onClick={onClick}
      >
        Sign Up
      </Link>
      <Link
        to="/login"
        className={linkClass}
        onClick={onClick}
      >
        Sign In
      </Link>
    </>
  );
}

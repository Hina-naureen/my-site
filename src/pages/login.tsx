import React from 'react';
import Layout from '@theme/Layout';
import LoginForm from '@site/src/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Layout title="Sign In" description="Sign in to your Physical AI Textbook account">
      <LoginForm />
    </Layout>
  );
}

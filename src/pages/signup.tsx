import React from 'react';
import Layout from '@theme/Layout';
import SignupForm from '@site/src/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <Layout title="Sign Up" description="Create your Physical AI Textbook account">
      <SignupForm />
    </Layout>
  );
}

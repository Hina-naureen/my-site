import React from 'react';
import Layout from '@theme/Layout';
import ProfileForm from '@site/src/components/auth/ProfileForm';

export default function ProfilePage() {
  return (
    <Layout title="My Profile" description="View and edit your Physical AI Textbook profile">
      <ProfileForm />
    </Layout>
  );
}

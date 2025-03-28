import { Redirect } from 'expo-router';

export default function Home() {
  return <Redirect href="/user-select" />;
  // return <Redirect href="/test-wifi" />;
}

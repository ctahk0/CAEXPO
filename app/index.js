import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { getData } from '../utils/storage';

export default function Home() {
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const checkActivation = async () => {
      const kod = await getData('activationCode');
      if (kod) {
        setRedirectTo('/user-select');
      } else {
        setRedirectTo('/activation-screen');
      }
    };

    checkActivation();
  }, []);

  if (!redirectTo) return null;
  return <Redirect href={redirectTo} />;
}

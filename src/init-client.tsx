import { useNavigate } from 'react-router-dom';
import { ReactElement, useContext, useEffect, useState } from 'react';
import { Loading } from './components/loading';
import { AppContext } from './app-context';
import { initClient } from './lib/ddc/operations';

type Props = {
  children: ReactElement;
};

export function InitClient({ children }: Props): ReactElement {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const { setClient, setAccount, setBucket } = useContext(AppContext);

  useEffect(() => {
    const controller = new AbortController();
    initClient(controller.signal).then((response) => {
      if (!controller.signal.aborted) {
        if (response?.client) {
          setClient(response.client);
        }

        if (response?.account) {
          setAccount(response.account);
        }

        if (response?.bucket) {
          setBucket(response.bucket);
        }
      }
    }).finally(() => {
      setLoaded(true);
    });
    return () => controller.abort();
  }, [navigate, setAccount, setBucket, setClient]);

  if (loaded) {
    return children;
  }

  return (
    <Loading text="Loading..." />
  );
}

import { useEffect } from "react";

const useAutoHide = (state, setState, timeout = 10000) => {
  useEffect(() => {
    if (!state) return;

    const timer = setTimeout(() => {
      setState(false);
    }, timeout);

    return () => clearTimeout(timer);
  }, [state, setState, timeout]);
};

export default useAutoHide;

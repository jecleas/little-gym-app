import {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type To = string;

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

type Location = {
  pathname: string;
  search: string;
  state?: unknown;
};

type RouterContextValue = {
  location: Location;
  navigate: (to: To, options?: NavigateOptions) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

const createLocation = (url: string, state?: unknown): Location => {
  const parsed = new URL(url, window.location.origin);
  return { pathname: parsed.pathname, search: parsed.search, state };
};

type BrowserRouterProps = {
  children: ReactNode;
};

export const BrowserRouter = ({ children }: BrowserRouterProps) => {
  const [location, setLocation] = useState<Location>(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
    state: history.state,
  }));

  useEffect(() => {
    const handlePopState = () => {
      setLocation({ pathname: window.location.pathname, search: window.location.search, state: history.state });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: To, options?: NavigateOptions) => {
    const { replace, state } = options || {};
    const newLocation = createLocation(to, state);
    if (replace) {
      window.history.replaceState(state, "", to);
    } else {
      window.history.pushState(state, "", to);
    }
    setLocation(newLocation);
  };

  const value = useMemo(() => ({ location, navigate }), [location]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

type RouteProps = {
  path: string;
  element: ReactElement;
};

export const Route = (props: RouteProps) => props.element;

const matchPath = (routePath: string, currentPath: string) => {
  const normalizedRoute = routePath.replace(/\/$/, "");
  const normalizedCurrent = currentPath.replace(/\/$/, "");
  return normalizedRoute === normalizedCurrent;
};

type RoutesProps = {
  children: ReactElement<RouteProps>[] | ReactElement<RouteProps>;
};

export const Routes = ({ children }: RoutesProps) => {
  const { location } = useRouterContext();
  const childArray = Array.isArray(children) ? children : [children];

  const match = childArray.find((child) => matchPath(child.props.path, location.pathname));
  return match ?? null;
};

type NavigateProps = {
  to: To;
  replace?: boolean;
  state?: unknown;
};

export const Navigate = ({ to, replace, state }: NavigateProps) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace: !!replace, state });
  }, [navigate, replace, state, to]);
  return null;
};

export const useNavigate = () => useRouterContext().navigate;

export const useLocation = () => useRouterContext().location;

export const useSearchParams = (): [URLSearchParams, (params: URLSearchParams | Record<string, string>) => void] => {
  const { location, navigate } = useRouterContext();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const setSearchParams = (params: URLSearchParams | Record<string, string>) => {
    const next = params instanceof URLSearchParams ? params : new URLSearchParams(params);
    const nextSearch = next.toString();
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ""}`, { replace: true });
  };

  return [searchParams, setSearchParams];
};

type RouterContextHook = () => RouterContextValue;

const useRouterContext: RouterContextHook = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("Router components must be wrapped in <BrowserRouter>");
  return ctx;
};

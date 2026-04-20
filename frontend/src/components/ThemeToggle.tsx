// Fixed light theme - no dark mode toggle needed
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const ThemeToggle = () => null;
export const useTheme = () => ({ theme: 'light' as const, toggle: () => {} });

import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import './styles/global.css';
import './styles/theme.css';
import './styles/Register.css';
import './styles/VerifyOtp.css';
import './styles/Dashboard.css';
import './styles/Booking.css';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </ThemeProvider>
  );
}

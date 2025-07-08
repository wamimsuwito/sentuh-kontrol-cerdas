
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface UseAdminFlowProps {
  onAdminPageOpen: () => void;
  onAdminLoginOpen: () => void;
}

export const useAdminFlow = ({
  onAdminPageOpen,
  onAdminLoginOpen
}: UseAdminFlowProps) => {
  const { isLoggedIn } = useAdminAuth();

  const handleAdminClick = () => {
    if (isLoggedIn) {
      onAdminPageOpen();
    } else {
      onAdminLoginOpen();
    }
  };

  const handleAdminLoginSuccess = () => {
    onAdminPageOpen();
  };

  return {
    handleAdminClick,
    handleAdminLoginSuccess
  };
};

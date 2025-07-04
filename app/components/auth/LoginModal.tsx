import { useState } from 'react';
import { Link } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { LoginForm } from './LoginForm';

interface LoginModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LoginModal({ children, open, onOpenChange }: LoginModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleLoginSuccess = () => {
    // Close modal and refresh page
    handleOpenChange(false);
    window.location.reload();
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>
        <LoginForm 
          onSuccess={handleLoginSuccess}
          redirectTo={currentUrl}
          action="/login"
          className="mt-4"
        />
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link 
            to="/sign-up" 
            className="underline underline-offset-4"
            onClick={() => handleOpenChange(false)}
          >
            Sign up
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
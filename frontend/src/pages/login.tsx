import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { FiPackage, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Please enter username and password');
      return;
    }

    try {
      await login(formData.username, formData.password);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      // Error is already handled by the store and displayed via useEffect
    }
  };

  return (
    <>
      <Head>
        <title>Login - HARD-POS PRO</title>
      </Head>

      <div className="min-h-screen flex">
        {/* Left side - Login form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-md w-full space-y-8">
            {/* Logo and title */}
            <div className="text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
                  <FiPackage className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Welcome to HARD-POS PRO
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Hardware & Building Supplies POS System
              </p>
            </div>

            {/* Login form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary py-3 text-base"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

              {/* Demo credentials */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</p>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Username:</strong> admin</p>
                  <p><strong>Password:</strong> admin123</p>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600">
              <p>© 2024 Helvino Technologies Limited</p>
              <p className="mt-1">Building Reliable Digital Foundation</p>
            </div>
          </div>
        </div>

        {/* Right side - Image/branding */}
        <div className="hidden lg:block relative w-0 flex-1">
          <Image
            src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200"
            alt="Hardware Store"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary-900 opacity-75"></div>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-white text-center">
              <h1 className="text-5xl font-bold mb-6">
                Professional POS System
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                Built specifically for hardware stores, building material suppliers, and tool retailers
              </p>
              <div className="grid grid-cols-2 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">100+</div>
                  <div className="text-primary-100">Features</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-primary-100">Support</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">KES</div>
                  <div className="text-primary-100">M-Pesa Ready</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">Kenya</div>
                  <div className="text-primary-100">Built for KE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

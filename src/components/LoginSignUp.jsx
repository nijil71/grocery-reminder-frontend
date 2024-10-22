import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import PhoneInputWithCountryCode from './PhoneInput';
const API_URL = 'http://127.0.0.1:5000';

const LoginSignup = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone_number: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [serverError, setServerError] = useState('');

  // Validation rules
  const validationRules = {
    username: [
      { test: (value) => value.length >= 3, message: 'Username must be at least 3 characters' },
      { test: (value) => /^[a-zA-Z0-9_]+$/.test(value), message: 'Username can only contain letters, numbers, and underscores' }
    ],
    password: [
      { test: (value) => value.length >= 8, message: 'Password must be at least 6 characters' },
      { test: (value) => /[A-Z]/.test(value), message: 'Password must contain at least one uppercase letter' },
      { test: (value) => /[a-z]/.test(value), message: 'Password must contain at least one lowercase letter' },
      { test: (value) => /[0-9]/.test(value), message: 'Password must contain at least one number' }
    ],
    phone_number: [
      { test: (value) => !value || value.replace(/\D/g, '').length >= 10, message: 'Phone number must be at least 10 digits' },
      { test: (value) => !value || /^\+?[\d\s-]+$/.test(value), message: 'Invalid phone number format' }
    ]
  };



  // Validate single field
  const validateField = (field, value) => {
    if (!validationRules[field]) return '';

    for (const rule of validationRules[field]) {
      if (!rule.test(value)) {
        return rule.message;
      }
    }
    return '';
  };

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    setServerError('');
  };

  // Validate all fields before submit
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      if (field === 'phoneNumber' && isLogin) return; // Skip phone validation for login
      
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    const endpoint = isLogin ? '/login' : '/register';
    const body = isLogin
      ? { username: formData.username, password: formData.password }
      : { ...formData };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('username', data.username);
          onLogin(data.username);
        } else {
          setIsLogin(true);
          setSuccess('Account created successfully, please login!');
          setFormData({ username: '', password: '', phoneNumber: '' });
        }
      } else {
        setServerError(data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      setServerError('Network error. Please try again.');
    }
  };

  const getInputStatus = (field) => {
    if (errors[field]) return "error";
    if (formData[field] && !errors[field]) return "success";
    return "default";
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-0">
      <Card className="w-full max-w-lg p-8">
        <CardHeader className="text-center mb-4">
          <CardTitle className="text-2xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {isLogin ? 'Login' : 'Sign Up'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {success && (
            <Alert className="mb-4 border border-green-500 text-green-500">
              <CheckCircledIcon className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="space-y-1">
              <Input
                type="text"
                value={formData.username}
                onChange={handleInputChange('username')}
                placeholder="Username"
                className={`${
                  errors.username ? 'border-red-500' : 
                  formData.username && !errors.username ? 'border-green-500' : ''
                }`}
                required
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
              {isChecking && (
                <p className="text-sm text-muted-foreground">Checking username availability...</p>
              )}
            </div>

            <div className="space-y-1">
              <Input
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Password"
                className={`${
                  errors.password ? 'border-red-500' : 
                  formData.password && !errors.password ? 'border-green-500' : ''
                }`}
                required
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <PhoneInputWithCountryCode
                  phoneNumber={formData.phone_number}
                  setPhoneNumber={(value) => {
                    setFormData(prev => ({ ...prev, phone_number: value }));
                    const error = validateField('phone_number', value);
                    setErrors(prev => ({ ...prev, phone_number: error }));
                  }}
                  error={errors.phone_number}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-500">{errors.phone_number}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full">
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>

          <Button 
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ username: '', password: '', phoneNumber: '' });
              setErrors({});
              setServerError('');
              setSuccess('');
            }} 
            variant="outline" 
            className="w-full mt-2"
          >
            {isLogin ? 'Need an account? Sign Up' : 'Have an account? Log In'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginSignup;
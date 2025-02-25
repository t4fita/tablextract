<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import { goto } from '$app/navigation';
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Checkbox from '$lib/components/ui/Checkbox.svelte';
  
  let email = '';
  let password = '';
  let confirmPassword = '';
  let acceptTerms = false;
  let isLoading = false;
  
  let emailError = '';
  let passwordError = '';
  let confirmPasswordError = '';
  let termsError = '';
  
  // Validate form
  function validateForm(): boolean {
    let isValid = true;
    
    // Reset errors
    emailError = '';
    passwordError = '';
    confirmPasswordError = '';
    termsError = '';
    
    // Validate email
    if (!email) {
      emailError = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      passwordError = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      passwordError = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      confirmPasswordError = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      confirmPasswordError = 'Passwords do not match';
      isValid = false;
    }
    
    // Validate terms acceptance
    if (!acceptTerms) {
      termsError = 'You must accept the terms and conditions';
      isValid = false;
    }
    
    return isValid;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isLoading = true;
    
    try {
      const { success, error } = await authStore.signUp(email, password);
      
      if (success) {
        toastStore.success('Account created successfully! Please check your email to verify your account.');
        goto('/dashboard');
      } else {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to create account';
        
        toastStore.error(errorMessage);
      }
    } catch (error) {
      toastStore.error('An error occurred during signup');
      console.error('Signup error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign Up | Tablextract</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-16rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        Create your account
      </h1>
      <p class="mt-2 text-sm text-gray-600">
        Already have an account? <a href="/login" class="font-medium text-primary-600 hover:text-primary-500">Log in</a>
      </p>
    </div>
    
    <Card>
      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            required
            bind:value={email}
            error={emailError}
            autocomplete="email"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            required
            bind:value={password}
            error={passwordError}
            autocomplete="new-password"
            disabled={isLoading}
            helpText="Password must be at least 8 characters"
          />
        </div>
        
        <div>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            required
            bind:value={confirmPassword}
            error={confirmPasswordError}
            autocomplete="new-password"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <Checkbox
            id="accept-terms"
            name="acceptTerms"
            bind:checked={acceptTerms}
            error={termsError}
            disabled={isLoading}
          >
            I agree to the <a href="/terms" class="text-primary-600 hover:text-primary-500">Terms of Service</a> and <a href="/privacy" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
          </Checkbox>
        </div>
        
        <div>
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Create account
          </Button>
        </div>
      </form>
    </Card>
  </div>
</div> 
<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import { goto } from '$app/navigation';
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  let email = '';
  let password = '';
  let isLoading = false;
  let emailError = '';
  let passwordError = '';
  
  // Validate form
  function validateForm(): boolean {
    let isValid = true;
    
    // Reset errors
    emailError = '';
    passwordError = '';
    
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
    }
    
    return isValid;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isLoading = true;
    
    try {
      const { success, error } = await authStore.signIn(email, password);
      
      if (success) {
        toastStore.success('Successfully logged in');
        goto('/dashboard');
      } else {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Invalid email or password';
        
        toastStore.error(errorMessage);
      }
    } catch (error) {
      toastStore.error('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login | Tablextract</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-16rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        Log in to your account
      </h1>
      <p class="mt-2 text-sm text-gray-600">
        Or <a href="/signup" class="font-medium text-primary-600 hover:text-primary-500">create a new account</a>
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
            autocomplete="current-password"
            disabled={isLoading}
          />
          
          <div class="mt-2 text-right">
            <a href="/forgot-password" class="text-sm font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>
        
        <div>
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Log in
          </Button>
        </div>
      </form>
    </Card>
  </div>
</div> 
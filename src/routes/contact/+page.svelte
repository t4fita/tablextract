<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { toastStore } from '$lib/stores/toast';
  
  let name = '';
  let email = '';
  let subject = '';
  let message = '';
  let isSubmitting = false;
  let formSubmitted = false;
  
  const subjects = [
    'General Inquiry',
    'Technical Support',
    'Billing Question',
    'Feature Request',
    'Partnership Opportunity',
    'Other'
  ];
  
  function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  async function handleSubmit() {
    // Basic validation
    if (!name || !email || !subject || !message) {
      toastStore.error('Please fill in all fields', {
        dismissible: true
      });
      return;
    }
    
    if (!validateEmail(email)) {
      toastStore.error('Please enter a valid email address', {
        dismissible: true
      });
      return;
    }
    
    isSubmitting = true;
    
    try {
      // In a real application, this would send data to a server endpoint
      // For now, we'll simulate a successful submission with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      name = '';
      email = '';
      subject = '';
      message = '';
      formSubmitted = true;
      
      toastStore.success('Your message has been sent! We\'ll get back to you soon.', {
        dismissible: true
      });
    } catch (error) {
      toastStore.error('Failed to send message. Please try again later.', {
        dismissible: true
      });
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Contact Us | Tablextract</title>
</svelte:head>

<div class="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
      Contact Us
    </h1>
    <p class="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
      Have questions about Tablextract? We're here to help. Fill out the form below
      and our team will get back to you as soon as possible.
    </p>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Contact Information -->
    <div class="lg:col-span-1">
      <Card>
        <div class="p-6 space-y-8">
          <h2 class="text-2xl font-bold text-gray-900">Get in Touch</h2>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Email</h3>
            <p class="text-gray-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-primary-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              support@tablextract.com
            </p>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Office</h3>
            <p class="text-gray-600 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-primary-600 mt-0.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span>
                123 Tech Avenue<br />
                Suite 400<br />
                San Francisco, CA 94107<br />
                United States
              </span>
            </p>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Hours</h3>
            <p class="text-gray-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-primary-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Monday - Friday: 9AM - 5PM PST
            </p>
          </div>
          
          <div class="pt-4">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Follow Us</h3>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-500 hover:text-primary-600">
                <span class="sr-only">Twitter</span>
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" class="text-gray-500 hover:text-primary-600">
                <span class="sr-only">LinkedIn</span>
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="#" class="text-gray-500 hover:text-primary-600">
                <span class="sr-only">GitHub</span>
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
    
    <!-- Contact Form -->
    <div class="lg:col-span-2">
      <Card>
        <div class="p-6">
          {#if formSubmitted}
            <div class="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto text-primary-600 mb-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p class="text-gray-600 mb-6">Your message has been sent successfully. We'll get back to you as soon as possible.</p>
              <Button on:click={() => formSubmitted = false}>Send Another Message</Button>
            </div>
          {:else}
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            <form on:submit|preventDefault={handleSubmit} class="space-y-6">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input 
                    id="name"
                    type="text"
                    bind:value={name}
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input 
                    id="email"
                    type="email"
                    bind:value={email}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  id="subject"
                  bind:value={subject}
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                >
                  <option value="" disabled selected>Select a subject</option>
                  {#each subjects as subjectOption}
                    <option value={subjectOption}>{subjectOption}</option>
                  {/each}
                </select>
              </div>
              
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  bind:value={message}
                  rows="6"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="How can we help you?"
                  required
                ></textarea>
              </div>
              
              <div class="flex justify-end">
                <Button 
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Send Message
                </Button>
              </div>
            </form>
          {/if}
        </div>
      </Card>
    </div>
  </div>
</div> 